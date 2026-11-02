import { createClient, type Client, type InStatement } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { demoEmployees } from "./seed.js";

export function createDatabase(url?: string): Client {
  const databaseUrl =
    url ?? process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL;
  if (process.env.VERCEL && !databaseUrl)
    throw new Error("A persistent database URL is required on Vercel");
  if (!databaseUrl) mkdirSync("data", { recursive: true });
  return createClient({
    url: databaseUrl ?? "file:data/people.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

export async function initializeDatabase(db: Client) {
  await db.batch(
    [
      `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
      `CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    )`,
      "CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at)",
      `CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      full_name TEXT NOT NULL, search_name TEXT NOT NULL, position TEXT NOT NULL, department TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', location TEXT NOT NULL DEFAULT '',
      photo_url TEXT NOT NULL DEFAULT '', bio TEXT NOT NULL DEFAULT '', joined_at TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
      "CREATE INDEX IF NOT EXISTS employees_user_department_idx ON employees(user_id, department)",
      `CREATE TABLE IF NOT EXISTS auth_attempts (key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expires_at INTEGER NOT NULL)`,
      "CREATE INDEX IF NOT EXISTS auth_attempts_expiry_idx ON auth_attempts(expires_at)",
    ],
    "write",
  );
}

export const normalizeSearch = (text: string) =>
  text.trim().toLocaleLowerCase("ru").replaceAll("ё", "е");

export function seedStatements(userId: string): InStatement[] {
  return demoEmployees.map((employee) => ({
    sql: `INSERT INTO employees (id, user_id, full_name, search_name, position, department, email, phone, location, photo_url, bio, joined_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      randomUUID(),
      userId,
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
  }));
}
