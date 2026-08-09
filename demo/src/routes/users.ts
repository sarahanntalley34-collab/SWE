import { Hono } from "hono";

export type UserPlan = "Starter" | "Pro" | "Enterprise";
export type UserStatus = "active" | "trialing" | "churned";

export interface User {
  id: string;
  name: string;
  email: string;
  plan: UserPlan;
  status: UserStatus;
  joined: string; // ISO date (YYYY-MM-DD)
  mrr: number;
}

// Static seed data — 30 realistic SaaS customers across plans and statuses.
const users: User[] = [
  { id: "usr_001", name: "Jane Cooper", email: "jane@acme.com", plan: "Pro", status: "active", joined: "2026-03-15", mrr: 99 },
  { id: "usr_002", name: "John Smith", email: "john@globex.com", plan: "Enterprise", status: "active", joined: "2025-11-02", mrr: 499 },
  { id: "usr_003", name: "Alice Johnson", email: "alice@initech.io", plan: "Starter", status: "active", joined: "2026-01-20", mrr: 29 },
  { id: "usr_004", name: "Bob Brown", email: "bob@umbrella.com", plan: "Pro", status: "active", joined: "2026-02-11", mrr: 99 },
  { id: "usr_005", name: "Carol Davis", email: "carol@stark.tech", plan: "Enterprise", status: "active", joined: "2026-01-05", mrr: 499 },
  { id: "usr_006", name: "David Wilson", email: "david@wayne.enterprises", plan: "Pro", status: "trialing", joined: "2026-07-28", mrr: 99 },
  { id: "usr_007", name: "Emma Martinez", email: "emma@acme.com", plan: "Starter", status: "churned", joined: "2025-09-14", mrr: 29 },
  { id: "usr_008", name: "Frank Garcia", email: "frank@globex.com", plan: "Pro", status: "active", joined: "2026-04-02", mrr: 99 },
  { id: "usr_009", name: "Grace Lee", email: "grace@initech.io", plan: "Starter", status: "active", joined: "2026-05-18", mrr: 29 },
  { id: "usr_010", name: "Henry Taylor", email: "henry@umbrella.com", plan: "Pro", status: "active", joined: "2026-03-30", mrr: 99 },
  { id: "usr_011", name: "Ivy Anderson", email: "ivy@stark.tech", plan: "Starter", status: "trialing", joined: "2026-08-01", mrr: 29 },
  { id: "usr_012", name: "Jack Thomas", email: "jack@wayne.enterprises", plan: "Enterprise", status: "active", joined: "2025-12-09", mrr: 499 },
  { id: "usr_013", name: "Karen White", email: "karen@acme.com", plan: "Pro", status: "active", joined: "2026-02-25", mrr: 99 },
  { id: "usr_014", name: "Liam Harris", email: "liam@globex.com", plan: "Starter", status: "churned", joined: "2025-10-03", mrr: 29 },
  { id: "usr_015", name: "Mia Clark", email: "mia@initech.io", plan: "Pro", status: "active", joined: "2026-01-14", mrr: 99 },
  { id: "usr_016", name: "Noah Lewis", email: "noah@umbrella.com", plan: "Enterprise", status: "active", joined: "2026-04-21", mrr: 499 },
  { id: "usr_017", name: "Olivia Robinson", email: "olivia@stark.tech", plan: "Pro", status: "active", joined: "2026-06-09", mrr: 99 },
  { id: "usr_018", name: "Paul Walker", email: "paul@wayne.enterprises", plan: "Starter", status: "active", joined: "2026-07-03", mrr: 29 },
  { id: "usr_019", name: "Quinn Young", email: "quinn@acme.com", plan: "Pro", status: "trialing", joined: "2026-08-05", mrr: 99 },
  { id: "usr_020", name: "Rachel King", email: "rachel@globex.com", plan: "Starter", status: "active", joined: "2026-03-08", mrr: 29 },
  { id: "usr_021", name: "Sam Wright", email: "sam@initech.io", plan: "Pro", status: "active", joined: "2026-05-27", mrr: 99 },
  { id: "usr_022", name: "Tina Lopez", email: "tina@umbrella.com", plan: "Starter", status: "churned", joined: "2025-08-19", mrr: 29 },
  { id: "usr_023", name: "Uma Hill", email: "uma@stark.tech", plan: "Enterprise", status: "active", joined: "2025-11-24", mrr: 499 },
  { id: "usr_024", name: "Victor Scott", email: "victor@wayne.enterprises", plan: "Pro", status: "active", joined: "2026-02-17", mrr: 99 },
  { id: "usr_025", name: "Wendy Green", email: "wendy@acme.com", plan: "Starter", status: "active", joined: "2026-06-23", mrr: 29 },
  { id: "usr_026", name: "Xavier Baker", email: "xavier@globex.com", plan: "Pro", status: "active", joined: "2026-07-15", mrr: 99 },
  { id: "usr_027", name: "Yara Adams", email: "yara@initech.io", plan: "Pro", status: "trialing", joined: "2026-08-08", mrr: 99 },
  { id: "usr_028", name: "Zachary Nelson", email: "zachary@umbrella.com", plan: "Starter", status: "active", joined: "2026-04-09", mrr: 29 },
  { id: "usr_029", name: "Ava Carter", email: "ava@stark.tech", plan: "Pro", status: "active", joined: "2026-05-04", mrr: 99 },
  { id: "usr_030", name: "Leo Mitchell", email: "leo@wayne.enterprises", plan: "Starter", status: "churned", joined: "2025-12-28", mrr: 29 },
];

const usersRouter = new Hono();

// GET /api/users?search=&plan=&status=&page=&limit=
// Search matches name or email (case-insensitive substring). Filters are
// case-insensitive. Pagination defaults to page=1, limit=20 (max 100).
usersRouter.get("/", (c) => {
  const search = (c.req.query("search") || "").trim().toLowerCase();
  const plan = (c.req.query("plan") || "").trim().toLowerCase();
  const status = (c.req.query("status") || "").trim().toLowerCase();
  const page = Math.max(1, Number.parseInt(c.req.query("page") || "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(c.req.query("limit") || "20", 10) || 20)
  );

  let filtered = users;

  if (search) {
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
    );
  }
  if (plan) {
    filtered = filtered.filter((u) => u.plan.toLowerCase() === plan);
  }
  if (status) {
    filtered = filtered.filter((u) => u.status === status);
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const pageUsers = filtered.slice(start, start + limit);

  return c.json({ users: pageUsers, total, page, totalPages });
});

export default usersRouter;
