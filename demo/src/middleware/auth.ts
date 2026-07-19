import type { Context, Next } from "hono";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "retro-demo-secret-change-in-production";

export interface JwtPayload {
  userId: number;
  email: string;
  role: "admin" | "viewer";
}

// Extend Hono's context variable types
declare module "hono" {
  interface ContextVariableMap {
    user: JwtPayload;
  }
}

/**
 * Hono middleware that verifies the JWT token from the Authorization header.
 * Expects: `Authorization: Bearer <token>`
 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid Authorization header" }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    c.set("user", payload);
    await next();
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
}

/**
 * Verify a JWT token and return the payload (used by WebSocket upgrade).
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Generate a JWT token for a given user.
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}
