import express, {
  type ErrorRequestHandler,
  type RequestHandler,
} from "express";
import helmet from "helmet";
import { randomBytes, randomUUID } from "node:crypto";
import { LibsqlError, type Client, type Row } from "@libsql/client";
import {
  employeeSchema,
  loginSchema,
  registerSchema,
  fieldErrors,
} from "../shared/validation.js";
import type { Employee, User } from "../shared/types.js";
import {
  initializeDatabase,
  normalizeSearch,
  seedStatements,
} from "./database.js";
import {
  cookieName,
  hashPassword,
  protectMutation,
  readSessionToken,
  sessionLifetime,
  setSessionCookie,
  tokenHash,
  verifyPassword,
} from "./security.js";

const userFromRow = (row: Row): User => ({
  id: String(row.id),
  name: String(row.name),
  email: String(row.email),
});
const employeeFromRow = (row: Row): Employee => ({
  id: String(row.id),
  fullName: String(row.full_name),
  position: String(row.position),
  department: String(row.department),
  email: String(row.email),
  phone: String(row.phone),
  location: String(row.location),
  photoUrl: String(row.photo_url),
  bio: String(row.bio),
  joinedAt: String(row.joined_at),
  createdAt: String(row.created_at),
});

export function createApp(db: Client) {
  const app = express();
  app.disable("x-powered-by");
  app.use(
    "/api",
    helmet(),
    (_req, res, next) => {
      res.set("Cache-Control", "no-store");
      next();
    },
    protectMutation,
    express.json({ limit: "16kb" }),
  );
  let initialized: Promise<void> | undefined;
  app.use("/api", async (_req, _res, next) => {
    initialized ??= initializeDatabase(db).catch((error) => {
      initialized = undefined;
      throw error;
    });
    await initialized;
    next();
  });

  const authenticate: RequestHandler = async (req, res, next) => {
    const token = readSessionToken(req);
    if (!token)
      return res
        .status(401)
        .json({ error: "Войдите, чтобы увидеть сотрудников" });
    const result = await db.execute({
      sql: "SELECT users.id, users.name, users.email FROM sessions JOIN users ON users.id = sessions.user_id WHERE token_hash = ? AND expires_at > ?",
      args: [tokenHash(token), Date.now()],
    });
    if (!result.rows[0])
      return res
        .status(401)
        .json({ error: "Сессия завершилась. Войдите ещё раз" });
    res.locals.user = userFromRow(result.rows[0]);
    next();
  };

  const rateLimit: RequestHandler = async (req, res, next) => {
    const address = process.env.VERCEL
      ? (req.get("x-vercel-forwarded-for") ?? req.socket.remoteAddress)
      : req.socket.remoteAddress;
    const key = tokenHash(address ?? "unknown");
    const now = Date.now();
    const result = await db.execute({
      sql: `INSERT INTO auth_attempts (key, attempts, expires_at) VALUES (?, 1, ?)
        ON CONFLICT(key) DO UPDATE SET attempts = CASE WHEN expires_at < ? THEN 1 ELSE attempts + 1 END,
        expires_at = CASE WHEN expires_at < ? THEN excluded.expires_at ELSE expires_at END RETURNING attempts`,
      args: [key, now + 15 * 60_000, now, now],
    });
    if (Number(result.rows[0].attempts) > 40) {
      res.set("Retry-After", "900");
      return res
        .status(429)
        .json({ error: "Слишком много попыток. Попробуйте через 15 минут" });
    }
    next();
  };

  app.get("/api/health", async (_req, res) => {
    await db.execute("SELECT 1");
    res.json({ status: "ok" });
  });
  app.get("/api/auth/me", authenticate, (_req, res) =>
    res.json({ user: res.locals.user }),
  );

  app.post("/api/auth/register", rateLimit, async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({
          error: "Проверьте поля формы",
          fields: fieldErrors(parsed.error),
        });
    const { name, email, password } = parsed.data;
    const user: User = { id: randomUUID(), name, email };
    const passwordHash = await hashPassword(password);
    const token = randomBytes(32).toString("hex");
    try {
      await db.batch(
        [
          {
            sql: "INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)",
            args: [user.id, name, email, passwordHash],
          },
          ...seedStatements(user.id),
          {
            sql: "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
            args: [tokenHash(token), user.id, Date.now() + sessionLifetime],
          },
        ],
        "write",
      );
    } catch (error) {
      if (error instanceof LibsqlError && error.code.includes("CONSTRAINT"))
        return res
          .status(409)
          .json({
            error: "Этот email уже зарегистрирован. Войдите в аккаунт",
            fields: { email: "Этот email уже зарегистрирован" },
          });
      throw error;
    }
    setSessionCookie(res, token);
    res.status(201).json({ user });
  });

  app.post("/api/auth/login", rateLimit, async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({
          error: "Проверьте email и пароль",
          fields: fieldErrors(parsed.error),
        });
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE email = ?",
      args: [parsed.data.email],
    });
    const row = result.rows[0];
    // Derive a key even for unknown users to avoid a cheap account-timing oracle.
    const storedHash = row
      ? String(row.password_hash)
      : `scrypt:${"0".repeat(32)}:${"0".repeat(128)}`;
    const valid = await verifyPassword(parsed.data.password, storedHash);
    if (!row || !valid)
      return res.status(401).json({ error: "Неверный email или пароль" });
    const token = randomBytes(32).toString("hex");
    const oldToken = readSessionToken(req);
    await db.batch(
      [
        {
          sql: "DELETE FROM sessions WHERE expires_at < ? OR token_hash = ?",
          args: [Date.now(), oldToken ? tokenHash(oldToken) : ""],
        },
        {
          sql: "DELETE FROM auth_attempts WHERE expires_at < ?",
          args: [Date.now()],
        },
        {
          sql: "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
          args: [
            tokenHash(token),
            String(row.id),
            Date.now() + sessionLifetime,
          ],
        },
      ],
      "write",
    );
    setSessionCookie(res, token);
    res.json({ user: userFromRow(row) });
  });

  app.post("/api/auth/logout", async (req, res) => {
    const token = readSessionToken(req);
    if (token)
      await db.execute({
        sql: "DELETE FROM sessions WHERE token_hash = ?",
        args: [tokenHash(token)],
      });
    res.clearCookie(cookieName, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    res.status(204).end();
  });

  app.use("/api/employees", authenticate);
  app.get("/api/employees", async (req, res) => {
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const department =
      typeof req.query.department === "string" ? req.query.department : "";
    if (search.length > 120 || department.length > 60)
      return res
        .status(400)
        .json({ error: "Слишком длинный поисковый запрос" });
    const user = res.locals.user as User;
    const result = await db.batch(
      [
        {
          sql: `SELECT * FROM employees WHERE user_id = ? AND instr(search_name, ?) > 0 AND (? = '' OR department = ?) ORDER BY created_at, rowid`,
          args: [user.id, normalizeSearch(search), department, department],
        },
        {
          sql: "SELECT department AS name, COUNT(*) AS count FROM employees WHERE user_id = ? GROUP BY department ORDER BY department",
          args: [user.id],
        },
      ],
      "read",
    );
    const departments = result[1].rows.map((row) => ({
      name: String(row.name),
      count: Number(row.count),
    }));
    res.json({
      employees: result[0].rows.map(employeeFromRow),
      departments,
      total: departments.reduce((sum, dept) => sum + dept.count, 0),
    });
  });

  app.post("/api/employees", async (req, res) => {
    const parsed = employeeSchema.safeParse(req.body);
    if (!parsed.success)
      return res
        .status(400)
        .json({
          error: "Проверьте поля формы",
          fields: fieldErrors(parsed.error),
        });
    const employee = parsed.data;
    const id = randomUUID();
    const user = res.locals.user as User;
    const result = await db.execute({
      sql: `INSERT INTO employees (id, user_id, full_name, search_name, position, department, email, phone, location, photo_url, bio, joined_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      args: [
        id,
        user.id,
        employee.fullName,
        normalizeSearch(employee.fullName),
        employee.position,
        employee.department,
        employee.email,
        employee.phone,
        employee.location,
        employee.photoUrl,
        employee.bio,
        employee.joinedAt,
      ],
    });
    res.status(201).json({ employee: employeeFromRow(result.rows[0]) });
  });

  app.use("/api", (_req, res) =>
    res.status(404).json({ error: "Такого API-метода нет" }),
  );
  const handleError: ErrorRequestHandler = (
    error: unknown,
    _req,
    res,
    _next,
  ) => {
    if (error instanceof SyntaxError && "body" in error)
      return res.status(400).json({ error: "Некорректный JSON" });
    if (
      error &&
      typeof error === "object" &&
      "type" in error &&
      error.type === "entity.too.large"
    )
      return res.status(413).json({ error: "Слишком большой запрос" });
    console.error(
      "API request failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    res
      .status(500)
      .json({ error: "Не удалось выполнить запрос. Попробуйте ещё раз" });
  };
  app.use(handleError);
  return app;
}
