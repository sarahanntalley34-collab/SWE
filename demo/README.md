# Shipwright Metrics Dashboard — Backend Demo

A real-time metrics dashboard backend built with **Bun**, **Hono**, **Drizzle ORM**, and **Neon PostgreSQL**.

Part of the [Shipwright Engineering](https://shipwright.ctonew.app) portfolio.

## Stack

- **Runtime:** [Bun](https://bun.sh)
- **Framework:** [Hono](https://hono.dev)
- **ORM:** [Drizzle](https://orm.drizzle.team)
- **Database:** [Neon](https://neon.tech) (serverless PostgreSQL)
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **Real-time:** Native Bun WebSocket

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.3
- A [Neon](https://neon.tech) PostgreSQL database

### Setup

1. **Clone and install dependencies:**

   ```bash
   cd demo
   bun install
   ```

2. **Set environment variables:**

   Create a `.env` file (or export directly):

   ```bash
   export DATABASE_URL="postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/dbname?sslmode=require"
   export JWT_SECRET="your-secret-key"  # optional, defaults to a demo secret
   ```

3. **Generate and run migrations:**

   ```bash
   bun run db:migrate
   ```

   If you need to generate migration files first:

   ```bash
   npx drizzle-kit generate
   ```

4. **Seed the database:**

   ```bash
   bun run db:seed
   ```

   Creates demo users and sample data:
   - **Admin:** admin@demo.com / password123
   - **Viewer:** viewer@demo.com / password123

5. **Start the dev server:**

   ```bash
   bun run dev
   ```

   The API runs on `http://localhost:3001`.

### Type-check

```bash
bun run build
```

## API Endpoints

### Auth

| Method | Path             | Auth     | Description                      |
|--------|------------------|----------|----------------------------------|
| POST   | `/api/auth/login`| No       | Login, returns JWT               |
| GET    | `/api/auth/me`   | Bearer   | Current user info                |

### Metrics

| Method | Path                | Auth     | Description                      |
|--------|---------------------|----------|----------------------------------|
| GET    | `/api/metrics`      | Bearer   | Recent metrics (24h), ?category= |
| GET    | `/api/metrics/live` | Bearer   | Latest metric snapshot           |

### Events

| Method | Path            | Auth     | Description                      |
|--------|------------------|----------|----------------------------------|
| GET    | `/api/events`    | Bearer   | Recent events, ?limit= & ?offset=|

### WebSocket

| Path  | Auth                  | Description                              |
|-------|-----------------------|------------------------------------------|
| `/ws` | JWT via `?token=`     | Real-time metrics push every 3-5 seconds |

Admin connections receive all fields (cpu, memory, requests_per_sec, active_users, errors).
Viewer connections receive a reduced set (cpu, memory only).

## Project Structure

```
demo/
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── README.md
└── src/
    ├── index.ts              # Hono server entry point
    ├── db/
    │   ├── index.ts          # Database connection (lazy)
    │   ├── schema.ts         # Drizzle schema definitions
    │   ├── migrate.ts        # Migration runner
    │   └── seed.ts           # Seed data script
    ├── middleware/
    │   └── auth.ts           # JWT verification middleware
    ├── routes/
    │   ├── auth.ts           # /api/auth/*
    │   ├── metrics.ts        # /api/metrics/*
    │   └── events.ts         # /api/events/*
    └── ws/
        └── index.ts          # WebSocket handler
```

## License

Portfolio demo — Shipwright Engineering
