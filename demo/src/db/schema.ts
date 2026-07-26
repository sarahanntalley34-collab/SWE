import {
  pgTable,
  serial,
  text,
  numeric,
  timestamp,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";

// ── Enums ────────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", ["admin", "viewer"]);

// ── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("viewer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Metrics ──────────────────────────────────────────────────────────────────

export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  value: numeric("value").notNull(),
  category: text("category").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// ── Events ───────────────────────────────────────────────────────────────────

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  userId: integer("user_id").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
