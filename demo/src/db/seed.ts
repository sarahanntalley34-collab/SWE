import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set. Skipping seed.");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Seeding database...");

  // ── Users ────────────────────────────────────────────────────────────────

  const passwordHash = await bcrypt.hash("password123", 10);

  const [admin] = await db
    .insert(schema.users)
    .values({
      email: "admin@demo.com",
      passwordHash,
      role: "admin",
    })
    .onConflictDoNothing()
    .returning({ id: schema.users.id });

  const [viewer] = await db
    .insert(schema.users)
    .values({
      email: "viewer@demo.com",
      passwordHash,
      role: "viewer",
    })
    .onConflictDoNothing()
    .returning({ id: schema.users.id });

  // If onConflictDoNothing returned nothing, fetch existing users
  let adminId: number | undefined = admin?.id;
  let viewerId: number | undefined = viewer?.id;

  if (adminId == null || viewerId == null) {
    const existing = await db.select().from(schema.users);
    const adminUser = existing.find((u) => u.email === "admin@demo.com");
    const viewerUser = existing.find((u) => u.email === "viewer@demo.com");
    adminId = adminUser?.id;
    viewerId = viewerUser?.id;
  }

  console.log(`  Users: admin@demo.com (id=${adminId}), viewer@demo.com (id=${viewerId})`);

  // ── Metrics ──────────────────────────────────────────────────────────────

  const now = new Date();
  const metricRows = [
    // cpu category
    { name: "cpu_usage", value: "45.2", category: "cpu", timestamp: new Date(now.getTime() - 60000) },
    { name: "cpu_usage", value: "52.1", category: "cpu", timestamp: new Date(now.getTime() - 120000) },
    { name: "cpu_usage", value: "38.7", category: "cpu", timestamp: new Date(now.getTime() - 180000) },
    { name: "cpu_usage", value: "61.3", category: "cpu", timestamp: new Date(now.getTime() - 240000) },
    { name: "cpu_usage", value: "44.8", category: "cpu", timestamp: new Date(now.getTime() - 300000) },
    // memory category
    { name: "memory_usage", value: "72.8", category: "memory", timestamp: new Date(now.getTime() - 60000) },
    { name: "memory_usage", value: "71.5", category: "memory", timestamp: new Date(now.getTime() - 120000) },
    { name: "memory_usage", value: "73.2", category: "memory", timestamp: new Date(now.getTime() - 180000) },
    { name: "memory_usage", value: "70.1", category: "memory", timestamp: new Date(now.getTime() - 240000) },
    { name: "memory_usage", value: "74.0", category: "memory", timestamp: new Date(now.getTime() - 300000) },
    // requests category
    { name: "requests_per_sec", value: "142", category: "requests", timestamp: new Date(now.getTime() - 60000) },
    { name: "requests_per_sec", value: "156", category: "requests", timestamp: new Date(now.getTime() - 120000) },
    { name: "requests_per_sec", value: "128", category: "requests", timestamp: new Date(now.getTime() - 180000) },
    { name: "requests_per_sec", value: "167", category: "requests", timestamp: new Date(now.getTime() - 240000) },
    { name: "requests_per_sec", value: "139", category: "requests", timestamp: new Date(now.getTime() - 300000) },
    // users category
    { name: "active_users", value: "837", category: "users", timestamp: new Date(now.getTime() - 60000) },
    { name: "active_users", value: "812", category: "users", timestamp: new Date(now.getTime() - 120000) },
    { name: "active_users", value: "845", category: "users", timestamp: new Date(now.getTime() - 180000) },
    { name: "active_users", value: "798", category: "users", timestamp: new Date(now.getTime() - 240000) },
    { name: "active_users", value: "823", category: "users", timestamp: new Date(now.getTime() - 300000) },
    { name: "error_rate", value: "0.5", category: "errors", timestamp: new Date(now.getTime() - 60000) },
    { name: "error_rate", value: "1.2", category: "errors", timestamp: new Date(now.getTime() - 120000) },
    { name: "error_rate", value: "0.3", category: "errors", timestamp: new Date(now.getTime() - 180000) },
    { name: "error_rate", value: "2.1", category: "errors", timestamp: new Date(now.getTime() - 240000) },
    { name: "error_rate", value: "0.7", category: "errors", timestamp: new Date(now.getTime() - 300000) },
  ];

  await db.insert(schema.metrics).values(metricRows);
  console.log(`  Inserted ${metricRows.length} metric rows`);

  // ── Events ───────────────────────────────────────────────────────────────

  const eventRows = [
    { type: "deployment", description: "Deployment completed: v2.4.1 to production", userId: adminId ?? null, timestamp: new Date(now.getTime() - 300000) },
    { type: "user", description: "New user registered: jane@example.com", userId: null, timestamp: new Date(now.getTime() - 600000) },
    { type: "alert", description: "CPU spike detected: 94% on node-3", userId: null, timestamp: new Date(now.getTime() - 900000) },
    { type: "deployment", description: "Rollback completed: v2.4.0 restored", userId: adminId ?? null, timestamp: new Date(now.getTime() - 1200000) },
    { type: "user", description: "New user registered: bob@example.com", userId: null, timestamp: new Date(now.getTime() - 1500000) },
    { type: "alert", description: "Memory usage exceeded 85% threshold", userId: null, timestamp: new Date(now.getTime() - 1800000) },
    { type: "system", description: "Nightly backup completed successfully", userId: null, timestamp: new Date(now.getTime() - 3600000) },
    { type: "deployment", description: "Feature flag 'dark-mode' enabled for 50%", userId: adminId ?? null, timestamp: new Date(now.getTime() - 7200000) },
    { type: "alert", description: "SSL certificate expiring in 7 days", userId: null, timestamp: new Date(now.getTime() - 14400000) },
    { type: "user", description: "Password reset requested for admin@demo.com", userId: adminId ?? null, timestamp: new Date(now.getTime() - 18000000) },
    { type: "system", description: "Database vacuum completed", userId: null, timestamp: new Date(now.getTime() - 21600000) },
    { type: "deployment", description: "Hotfix deployed: payment timeout fix", userId: adminId ?? null, timestamp: new Date(now.getTime() - 25200000) },
  ];

  await db.insert(schema.events).values(eventRows);
  console.log(`  Inserted ${eventRows.length} event rows`);

  console.log("✅ Seed complete.");
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
