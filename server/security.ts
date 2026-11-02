import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { Request, Response, NextFunction } from "express";

const deriveKey = promisify(scrypt);
export const tokenHash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export const sessionLifetime = 7 * 24 * 60 * 60 * 1000;
export const cookieName = "people_session";

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await deriveKey(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [, salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex) return false;
  const actual = (await deriveKey(password, salt, 64)) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function readSessionToken(req: Request) {
  const value = req.headers.cookie
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1);
  return value && /^[a-f0-9]{64}$/.test(value) ? value : undefined;
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionLifetime,
  });
}

export function protectMutation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.headers.origin;
  const expectedHost = req.get("host");
  let invalidOrigin: boolean;
  try {
    invalidOrigin = !!origin && new URL(origin).host !== expectedHost;
  } catch {
    invalidOrigin = true;
  }
  if (invalidOrigin || req.headers["sec-fetch-site"] === "cross-site") {
    return res.status(403).json({ error: "Запрос с другого сайта запрещён" });
  }
  if (!req.is("application/json"))
    return res.status(415).json({ error: "Ожидается JSON" });
  next();
}
