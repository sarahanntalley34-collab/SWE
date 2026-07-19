import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { signToken, authMiddleware } from "../middleware/auth";

const auth = new Hono();

const DEMO_MODE = !process.env.DATABASE_URL;

const DEMO_USERS: Record<string, { id: number; email: string; password: string; role: string }> = {
  "admin@demo.com": { id: 1, email: "admin@demo.com", password: "password123", role: "admin" },
  "viewer@demo.com": { id: 2, email: "viewer@demo.com", password: "password123", role: "viewer" },
};

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

  // Demo mode: accept hardcoded credentials when no database
  if (DEMO_MODE) {
    const demoUser = DEMO_USERS[email];
    if (!demoUser || demoUser.password !== password) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    const token = signToken({
      userId: demoUser.id,
      email: demoUser.email,
      role: demoUser.role,
    });

    return c.json({
      token,
      user: {
        id: demoUser.id,
        email: demoUser.email,
        role: demoUser.role,
      },
    });
  }

  // Production mode: query database
  const { db } = await import("../db");
  const { users } = await import("../db/schema");
  const { eq } = await import("drizzle-orm");

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

  // Demo mode: return from hardcoded users
  if (DEMO_MODE) {
    const demoUser = Object.values(DEMO_USERS).find((u) => u.id === payload.userId);
    if (!demoUser) {
      return c.json({ error: "User not found" }, 404);
    }
    return c.json({
      user: {
        id: demoUser.id,
        email: demoUser.email,
        role: demoUser.role,
        createdAt: new Date().toISOString(),
      },
    });
  }

  const { db } = await import("../db");
  const { users } = await import("../db/schema");
  const { eq } = await import("drizzle-orm");

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
