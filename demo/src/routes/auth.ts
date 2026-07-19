import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { signToken, authMiddleware } from "../middleware/auth";

const auth = new Hono();

// POST /api/auth/login
auth.post("/login", async (c) => {
  let body: { email?: string; password?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
});

// GET /api/auth/me — protected
auth.get("/me", authMiddleware, async (c) => {
  const payload = c.get("user");

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1);

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({ user });
});

export default auth;
