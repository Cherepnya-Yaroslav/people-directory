import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import { createDatabase } from "../server/database.js";
import { createApp } from "../server/app.js";
import { tokenHash } from "../server/security.js";

const account = {
  name: "Проверка",
  email: "test@example.com",
  password: "TestPassword123!",
};
const employee = {
  fullName: "Фёдор Иванович Тестов",
  position: "Разработчик",
  department: "Тестирование",
  email: "fedor@example.com",
  location: "Москва",
  bio: "Проверка сохранения",
};

test("complete authentication, isolation, filtering and persistence lifecycle", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "people-test-"));
  const url = `file:${join(directory, "test.db")}`;
  let db = createDatabase(url);
  let app = createApp(db);
  let cookie = "";
  let employeeId = "";
  try {
    await t.test("API refuses unauthenticated reads and writes", async () => {
      assert.equal((await request(app).get("/api/employees")).status, 401);
      assert.equal(
        (await request(app).post("/api/employees").send(employee)).status,
        401,
      );
    });
    await t.test(
      "registration validates fields, hashes passwords and seeds exactly five profiles",
      async () => {
        assert.equal(
          (
            await request(app)
              .post("/api/auth/register")
              .send({ ...account, password: "short" })
          ).status,
          400,
        );
        const response = await request(app)
          .post("/api/auth/register")
          .send(account);
        assert.equal(response.status, 201);
        cookie = response.headers["set-cookie"][0].split(";")[0];
        assert.match(response.headers["set-cookie"][0], /HttpOnly/);
        assert.match(response.headers["set-cookie"][0], /SameSite=Lax/);
        const users = await db.execute("SELECT password_hash FROM users");
        assert.notEqual(users.rows[0].password_hash, account.password);
        assert.match(String(users.rows[0].password_hash), /^scrypt:/);
        assert.equal(response.body.user.password_hash, undefined);
        const responseList = await request(app)
          .get("/api/employees")
          .set("Cookie", cookie);
        assert.equal(responseList.body.employees.length, 5);
        for (const profile of responseList.body.employees) {
          for (const key of [
            "fullName",
            "position",
            "department",
            "email",
            "phone",
            "location",
            "photoUrl",
            "bio",
            "joinedAt",
          ])
            assert.ok(profile[key], `Missing ${key}`);
        }
      },
    );
    await t.test(
      "duplicate normalized email and incorrect credentials are rejected",
      async () => {
        assert.equal(
          (
            await request(app)
              .post("/api/auth/register")
              .send({ ...account, email: "TEST@example.com" })
          ).status,
          409,
        );
        assert.equal(
          (
            await request(app)
              .post("/api/auth/login")
              .send({ ...account, password: "incorrect" })
          ).status,
          401,
        );
      },
    );
    await t.test(
      "mutations reject cross-site requests and invalid employee data",
      async () => {
        assert.equal(
          (
            await request(app)
              .post("/api/employees")
              .set("Cookie", cookie)
              .set("Origin", "https://attacker.example")
              .send(employee)
          ).status,
          403,
        );
        assert.equal(
          (
            await request(app)
              .post("/api/employees")
              .set("Cookie", cookie)
              .send({ fullName: "  " })
          ).status,
          400,
        );
        assert.equal(
          (
            await request(app)
              .post("/api/employees")
              .set("Cookie", cookie)
              .send({ ...employee, photoUrl: "javascript:alert(1)" })
          ).status,
          400,
        );
        assert.equal(
          (
            await request(app)
              .post("/api/employees")
              .set("Cookie", cookie)
              .send({ ...employee, joinedAt: "2026-02-31" })
          ).status,
          400,
        );
      },
    );
    await t.test(
      "new employee and Cyrillic search/filter work together, SQL strings remain data",
      async () => {
        const created = await request(app)
          .post("/api/employees")
          .set("Cookie", cookie)
          .send(employee);
        assert.equal(created.status, 201);
        employeeId = created.body.employee.id;
        const found = await request(app)
          .get("/api/employees")
          .query({ search: "ФЕДОР", department: employee.department })
          .set("Cookie", cookie);
        assert.equal(found.body.employees.length, 1);
        assert.equal(found.body.employees[0].id, employeeId);
        assert.equal(found.body.total, 6);
        assert.equal(
          (
            await request(app)
              .get("/api/employees")
              .query({ search: "' OR 1=1 --" })
              .set("Cookie", cookie)
          ).body.employees.length,
          0,
        );
        assert.equal(
          (
            await request(app)
              .get("/api/employees")
              .query({ search: "ФЕДОР", department: "Дизайн" })
              .set("Cookie", cookie)
          ).body.employees.length,
          0,
        );
      },
    );
    await t.test(
      "concurrent registrations and employee writes are atomic",
      async () => {
        const registrations = await Promise.all(
          [0, 1].map(() =>
            request(app)
              .post("/api/auth/register")
              .send({ ...account, email: "race@example.com" }),
          ),
        );
        assert.deepEqual(
          registrations.map((result) => result.status).sort(),
          [201, 409],
        );
        const writes = await Promise.all(
          [1, 2, 3].map((n) =>
            request(app)
              .post("/api/employees")
              .set("Cookie", cookie)
              .send({ ...employee, fullName: `Коллега ${n}` }),
          ),
        );
        assert.ok(writes.every((result) => result.status === 201));
        assert.equal(
          (await request(app).get("/api/employees").set("Cookie", cookie)).body
            .total,
          9,
        );
      },
    );
    await t.test(
      "separate accounts cannot see each other’s employees",
      async () => {
        const response = await request(app)
          .post("/api/auth/register")
          .send({ ...account, email: "second@example.com" });
        const secondCookie = response.headers["set-cookie"][0].split(";")[0];
        const result = await request(app)
          .get("/api/employees")
          .set("Cookie", secondCookie);
        assert.equal(result.body.total, 5);
        assert.ok(
          !result.body.employees.some(
            (item: { id: string }) => item.id === employeeId,
          ),
        );
      },
    );
    await t.test(
      "a closed/reopened database retains accounts, sessions and added employees",
      async () => {
        db.close();
        db = createDatabase(url);
        app = createApp(db);
        const result = await request(app)
          .get("/api/employees")
          .set("Cookie", cookie);
        assert.equal(result.status, 200);
        assert.equal(result.body.total, 9);
        assert.ok(
          result.body.employees.some(
            (item: { id: string }) => item.id === employeeId,
          ),
        );
        const login = await request(app).post("/api/auth/login").send(account);
        assert.equal(login.status, 200);
      },
    );
    await t.test("logout invalidates the server-side session", async () => {
      assert.equal(
        (
          await request(app)
            .post("/api/auth/logout")
            .set("Cookie", cookie)
            .send({})
        ).status,
        204,
      );
      assert.equal(
        (await request(app).get("/api/employees").set("Cookie", cookie)).status,
        401,
      );
    });
    await t.test("expired sessions are rejected", async () => {
      const login = await request(app).post("/api/auth/login").send(account);
      const expiredCookie = login.headers["set-cookie"][0].split(";")[0];
      await db.execute({
        sql: "UPDATE sessions SET expires_at = 1 WHERE token_hash = ?",
        args: [tokenHash(expiredCookie.split("=")[1])],
      });
      assert.equal(
        (await request(app).get("/api/auth/me").set("Cookie", expiredCookie))
          .status,
        401,
      );
    });
    await t.test(
      "malformed requests return JSON errors without internals",
      async () => {
        assert.equal(
          (
            await request(app)
              .post("/api/auth/login")
              .set("Content-Type", "application/json")
              .send("{broken")
          ).status,
          400,
        );
        assert.equal((await request(app).get("/api/nonexistent")).status, 404);
      },
    );
  } finally {
    db.close();
    await rm(directory, { recursive: true, force: true });
  }
});
