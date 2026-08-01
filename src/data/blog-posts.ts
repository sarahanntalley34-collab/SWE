export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  content: string; // HTML string
}

export const blogPosts: BlogPost[] = [
  {
    slug: "debugging-websocket-proxy-issues-bun",
    title: "Debugging WebSocket Connection Issues in Production: A Real-World Proxy Fix",
    date: "2026-08-01",
    excerpt: "Our dashboard showed 'reconnecting…' forever while the HTTP API worked fine. Here's the investigation, the root cause in Bun's fetch()-based proxy, and the server.upgrade() fix that solved it.",
    tags: ["WebSocket", "Bun", "Debugging", "Proxy", "Production"],
    content: `<p>Last week, we deployed a real-time metrics dashboard for a client. HTTP endpoints worked perfectly. The WebSocket connection? It showed "reconnecting…" forever. Here's the full debugging story — what we tried, what we found, and the proxy fix that made everything work.</p>

<h2>The Symptom</h2>

<p>We proxy all traffic through a single Bun server that serves the frontend, handles API routes, and forwards requests to backend services. After deploying the dashboard, everything looked fine — pages loaded, API calls returned data. But the live metrics panel sat there with a spinner and the dreaded word: <strong>reconnecting…</strong></p>

<p>The browser console told us exactly what was happening:</p>

<pre><code>WebSocket connection to 'wss://example.com/demo/ws' failed
WebSocket closed — reconnecting in 2s…
WebSocket connection to 'wss://example.com/demo/ws' failed
WebSocket closed — reconnecting in 4s…</code></pre>

<p>Our WebSocket client was trying to connect, the connection was being rejected (or silently dropped), and the exponential backoff loop kept retrying — forever.</p>

<h2>First Check: Is the Backend WebSocket Even Working?</h2>

<p>Before blaming the proxy, we verified the backend WebSocket server directly. We SSH'd into the server and hit the WebSocket endpoint locally:</p>

<pre><code># Direct connection to the backend — bypassing the proxy
$ wscat -c ws://localhost:3002/demo/ws
Connected (press CTRL+C to quit)
&lt; {"type":"metrics","payload":{"cpu":42.3,"memory":67.1}}
&lt; {"type":"metrics","payload":{"cpu":45.1,"memory":67.4}}</code></pre>

<p>The backend was fine. It accepted WebSocket connections and pushed data every few seconds. The problem was somewhere between the browser and the backend — specifically, in our proxy layer.</p>

<h2>The Proxy: A Bun.serve with fetch()</h2>

<p>Our proxy was straightforward. A single <code>Bun.serve</code> instance handled all incoming requests and forwarded them to the right backend:</p>

<pre><code>// The broken proxy approach — using fetch() for everything
Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // Proxy /demo/* to the demo backend
    if (url.pathname.startsWith("/demo")) {
      const backendUrl = "http://localhost:3002" + url.pathname + url.search;
      // This works for HTTP… but what about WebSocket upgrade requests?
      return fetch(backendUrl, {
        method: req.method,
        headers: req.headers,
        body: req.body,
      });
    }

    // Serve the frontend
    return serveStatic(req);
  },
});</code></pre>

<p>This looks reasonable. <code>fetch()</code> is Bun's universal request handler — it works for GET, POST, PUT, everything. And it <em>did</em> work for all our HTTP traffic. The demo API, the auth endpoints, the static assets — all served perfectly through this proxy.</p>

<p>So why did WebSocket connections fail?</p>

<h2>The Investigation: Tracing the WebSocket Handshake</h2>

<p>A WebSocket connection starts as a regular HTTP request with a special <code>Upgrade: websocket</code> header. The server responds with <code>101 Switching Protocols</code>, and the TCP connection is upgraded from HTTP to the WebSocket protocol. After that, bidirectional binary frames flow over the same connection.</p>

<p>We added logging to trace the proxy path:</p>

<pre><code>async fetch(req) {
  const url = new URL(req.url);
  console.log("Incoming:", req.method, url.pathname, req.headers.get("upgrade"));

  if (url.pathname.startsWith("/demo")) {
    const backendUrl = "http://localhost:3002" + url.pathname + url.search;
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: req.headers,
      body: req.body,
    });

    console.log("Backend response status:", response.status);
    return response;
  }
  // ...
}</code></pre>

<p>The log confirmed our suspicion:</p>

<pre><code>Incoming: GET /demo/ws websocket
Backend response status: 200</code></pre>

<p>A <strong>200 OK</strong> instead of <strong>101 Switching Protocols</strong>. The WebSocket upgrade was failing at the proxy level — the backend returned a 101, but <code>fetch()</code> wasn't propagating it correctly.</p>

<h2>The Root Cause: fetch() Silently Drops WebSocket Upgrades</h2>

<p>Here's the core issue: <strong><code>fetch()</code> is designed for HTTP request-response cycles, not for protocol upgrades.</strong> When the backend returns a <code>101 Switching Protocols</code> response, <code>fetch()</code> doesn't know what to do with it. The 101 response means "we're switching to a different protocol now" — but <code>fetch()</code> expects a regular HTTP response with a body.</p>

<p>What actually happens:</p>

<ol>
  <li>The browser sends an HTTP GET with <code>Upgrade: websocket</code> to our proxy</li>
  <li>Our proxy forwards it to the backend via <code>fetch()</code></li>
  <li>The backend returns <code>101 Switching Protocols</code></li>
  <li><code>fetch()</code> consumes the 101 but returns a generic response (often a 200, or it may error out)</li>
  <li>The browser receives a regular HTTP response instead of a protocol upgrade</li>
  <li>The browser's <code>new WebSocket()</code> call fails — the connection never upgrades</li>
  <li>The WebSocket client enters its reconnection loop</li>
</ol>

<p>The key insight: <strong>a 101 response is not an error.</strong> The backend did its job. The proxy did its job — for HTTP. But <code>fetch()</code> doesn't support the WebSocket upgrade path. It handles HTTP response bodies, not raw socket upgrades.</p>

<h2>The Fix: Bun's Native server.upgrade()</h2>

<p>Bun provides a built-in WebSocket upgrade mechanism through <code>server.upgrade()</code>. Instead of forwarding the request via <code>fetch()</code>, we detect WebSocket upgrade requests and handle them with Bun's native WebSocket API:</p>

<pre><code>// The working fix — using server.upgrade() for WebSocket requests
Bun.serve({
  port: 3000,

  async fetch(req, server) {
    const url = new URL(req.url);

    // Detect WebSocket upgrade requests
    if (url.pathname.startsWith("/demo/ws")) {
      const upgraded = server.upgrade(req, {
        data: { targetUrl: "ws://localhost:3002" + url.pathname },
      });
      if (upgraded) return; // Bun handles the 101 response
      return new Response("WebSocket upgrade failed", { status: 400 });
    }

    // HTTP proxy (unchanged) — fetch() works fine here
    if (url.pathname.startsWith("/demo")) {
      const backendUrl = "http://localhost:3002" + url.pathname + url.search;
      return fetch(backendUrl, {
        method: req.method,
        headers: req.headers,
        body: req.body,
      });
    }

    return serveStatic(req);
  },

  websocket: {
    open(ws) {
      const { targetUrl } = ws.data as { targetUrl: string };
      console.log("Proxy WS open — connecting to backend:", targetUrl);

      // Connect to the real backend WebSocket server
      const backend = new WebSocket(targetUrl);

      backend.onopen = () => {
        console.log("Backend WS connected");
      };

      backend.onmessage = (event) => {
        // Relay backend messages to the browser client
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(event.data);
        }
      };

      backend.onclose = () => {
        console.log("Backend WS closed — closing client");
        ws.close();
      };

      backend.onerror = (err) => {
        console.error("Backend WS error:", err);
        ws.close();
      };

      // Store the backend connection so we can relay client messages
      (ws as any).backend = backend;
    },

    message(ws, message) {
      // Relay browser client messages to the backend
      const backend = (ws as any).backend as WebSocket | undefined;
      if (backend && backend.readyState === WebSocket.OPEN) {
        backend.send(message);
      }
    },

    close(ws) {
      const backend = (ws as any).backend as WebSocket | undefined;
      if (backend) {
        backend.close();
      }
    },
  },
});</code></pre>

<p>This works because:</p>

<ul>
  <li><strong><code>server.upgrade(req)</code></strong> handles the <code>101 Switching Protocols</code> response correctly — it upgrades the TCP connection in-place, which is exactly what the browser expects.</li>
  <li><strong>The <code>websocket</code> handler</strong> gives us lifecycle hooks (open, message, close) for the proxied client connection.</li>
  <li><strong>We create a second WebSocket</strong> to the backend and relay messages bidirectionally. The browser talks to our proxy, our proxy talks to the backend, and messages flow through in both directions.</li>
  <li><strong>HTTP requests still go through <code>fetch()</code></strong> — no change needed for the REST API. The two paths coexist cleanly in the same server.</li>
</ul>

<h2>Verifying the Fix</h2>

<p>After deploying the fix, we checked the browser console:</p>

<pre><code>WebSocket connection established
&lt; {"type":"metrics","payload":{"cpu":43.8,"memory":68.2}}
&lt; {"type":"metrics","payload":{"cpu":41.2,"memory":68.5}}</code></pre>

<p>And on the server side:</p>

<pre><code>Incoming: GET /demo/ws websocket
Proxy WS open — connecting to backend: ws://localhost:3002/demo/ws
Backend WS connected</code></pre>

<p>The dashboard lit up with real-time metrics. No more "reconnecting…" spinner. No more exponential backoff loops in the console.</p>

<h2>Lessons Learned</h2>

<h3>1. Always Test WebSocket Paths Through the Full Proxy Chain</h3>

<p>We tested the WebSocket backend directly and it worked. We tested the HTTP API through the proxy and it worked. But we never tested the WebSocket <em>through the proxy</em> before deploying. A 30-second check with <code>wscat</code> against the proxy URL would have caught this in development.</p>

<h3>2. fetch() Is Not a Universal Proxy</h3>

<p><code>fetch()</code> is excellent for HTTP request-response patterns. But protocol upgrades — WebSocket, Server-Sent Events, HTTP/2 server push — are fundamentally different. They require the proxy to understand and propagate the upgrade handshake, not just forward a response body.</p>

<h3>3. Bun's server.upgrade() Is the Right Tool</h3>

<p>Bun ships with a first-class WebSocket API that integrates directly with <code>Bun.serve</code>. When you need to proxy WebSocket connections, <code>server.upgrade()</code> + the <code>websocket</code> handler is the correct approach. It handles the 101 response, keeps the TCP connection open, and gives you hooks to relay messages.</p>

<h3>4. Log Upgrade Headers in Your Proxy</h3>

<p>Adding a single log line for the <code>Upgrade</code> header made the diagnosis trivial. Without it, we would have spent much longer guessing whether the problem was in the backend, the proxy, or the client. Instrument your proxy to log upgrade requests — you'll thank yourself later.</p>

<h2>The Bigger Picture</h2>

<p>This bug was subtle because everything appeared to work. HTTP traffic flowed. The backend responded. The only clue was a silent connection failure in the browser console. In a production system with real users, this would have manifested as "the dashboard just spins forever" — a vague bug report that's hard to reproduce without knowing the proxy is the culprit.</p>

<p>The fix itself was straightforward once we understood the problem: detect WebSocket upgrade requests in the proxy, use <code>server.upgrade()</code> instead of <code>fetch()</code>, and relay messages bidirectionally. The hard part was tracing the connection path end-to-end to find where the upgrade was being dropped.</p>

<p>If you're running a Bun proxy in front of WebSocket services, check your <code>fetch()</code> handler. If you see <code>Upgrade: websocket</code> headers coming in and 200 responses going out, you've got the same bug we did. The fix is <code>server.upgrade()</code>.</p>

<hr>

<p><em>Retro Engineering builds and debugs production systems end-to-end — from WebSocket proxies to real-time dashboards. <a href="/contact">Get in touch</a> if you're hitting infrastructure issues that need a deep-dive fix.</em></p>`
  },
  {
    slug: "real-time-metrics-dashboard-websockets-neon",
    title: "How We Built a Real-Time Metrics Dashboard with WebSockets and Neon",
    date: "2026-07-20",
    excerpt: "A technical deep-dive into building a live-updating dashboard — from WebSocket architecture and JWT auth to role-based views and real-time data streaming.",
    tags: ["React", "WebSocket", "PostgreSQL", "TypeScript"],
    content: `<p>When we set out to build a portfolio demo for Retro Engineering, we wanted something that would actually demonstrate the kind of work we do — not a todo app, not a landing page. We built a real-time metrics dashboard with live-updating charts, JWT authentication, role-based views, and a Postgres backend. Here's how we put it together.</p>

<h2>The Stack</h2>

<p>We chose tools that are lightweight, modern, and fast to develop with:</p>

<ul>
  <li><strong>Bun + Hono</strong> for the API layer — Hono gives us a clean, Express-like routing experience with first-class TypeScript support, and Bun's runtime is fast enough that we never thought about performance</li>
  <li><strong>WebSocket server</strong> built into the same Hono app — no separate service, no Redis pub/sub for a demo</li>
  <li><strong>Drizzle ORM + Neon</strong> for the database — serverless Postgres with a nice migration story</li>
  <li><strong>React 19 + Vite + Recharts + Tailwind CSS 4</strong> for the frontend — the latest versions of everything, because we like sharp tools</li>
  <li><strong>JWT</strong> for authentication, with bcryptjs for password hashing</li>
</ul>

<h2>Architecture</h2>

<p>The backend is a single Hono app serving three things:</p>

<ol>
  <li><strong>REST API</strong> — auth endpoints (login/me), metrics history, event stream</li>
  <li><strong>WebSocket server</strong> — pushes simulated metrics to connected clients every 3-5 seconds</li>
  <li><strong>Static file serving</strong> — in production, the Vite-built frontend is served from the same process</li>
</ol>

<p>The frontend is a standard Vite + React app with a clean component tree:</p>

<pre><code>App
├── AuthGuard (redirects to login if no token)
├── Header (app title, user info, logout)
├── DashboardPage
│   ├── MetricCard × 4 (CPU, Memory, Requests, Errors)
│   ├── MetricsChart × 2 (CPU over time, Memory over time)
│   └── ActivityFeed</code></pre>

<h2>WebSocket: The Interesting Part</h2>

<p>The WebSocket layer is where things get fun. On connection, the server validates the JWT from a query parameter, then starts pushing simulated metric data every 3-5 seconds. We generate realistic-looking data with some randomness — CPU hovering around 40-60%, memory creeping up, request counts spiking occasionally.</p>

<p>The client uses a custom <code>useWebSocket</code> hook that handles:</p>

<ul>
  <li><strong>Auto-reconnect</strong> with exponential backoff</li>
  <li><strong>JWT refresh</strong> when the token expires mid-session</li>
  <li><strong>JSON parsing</strong> of incoming messages</li>
  <li><strong>Type safety</strong> — all metric payloads are typed, so the component layer never has to guess</li>
</ul>

<pre><code>// Simplified version of the hook
function useWebSocket(token: string) {
  const [metrics, setMetrics] = useState&lt;LiveMetrics | null&gt;(null);
  const wsRef = useRef&lt;WebSocket | null&gt;(null);

  const connect = useCallback(() => {
    const ws = new WebSocket('ws://localhost:3001/ws?token=' + token);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'metrics') {
        setMetrics(data.payload);
      }
    };
    
    ws.onclose = () => {
      // Reconnect with backoff
      setTimeout(connect, 2000);
    };
    
    wsRef.current = ws;
  }, [token]);

  useEffect(() => { connect(); return () => wsRef.current?.close(); }, [connect]);
  
  return metrics;
}</code></pre>

<h2>Role-Based Views</h2>

<p>We wanted the demo to show something practical: different users see different data. The seed script creates two users:</p>

<ul>
  <li><strong>admin@demo.com</strong> — sees CPU, Memory, Requests, Errors (full dashboard)</li>
  <li><strong>viewer@demo.com</strong> — sees only CPU and Memory (limited view)</li>
</ul>

<p>This is enforced server-side — the JWT includes the user's role, and the metrics endpoint filters accordingly. The frontend respects it too — the dashboard component renders different metric cards based on the role.</p>

<h2>Database Design</h2>

<p>The schema is intentionally simple but realistic:</p>

<ul>
  <li><strong>users</strong> — id, email, password_hash, role, created_at</li>
  <li><strong>metrics</strong> — id, cpu_percent, memory_percent, request_count, error_count, recorded_at</li>
  <li><strong>events</strong> — id, type, message, user_id (FK to users), created_at</li>
</ul>

<p>We used Drizzle for migrations. The migration file is checked into the repo, and the seed script creates sample data so anyone can clone and run.</p>

<h2>What We'd Do Differently in Production</h2>

<p>This is a demo, so we made some tradeoffs:</p>

<ul>
  <li><strong>Demo mode fallback</strong>: The API runs without a database if DATABASE_URL isn't set, using hardcoded demo users. In production, this would be removed.</li>
  <li><strong>No rate limiting</strong>: The WebSocket has no connection limits. Production would need per-user connection caps.</li>
  <li><strong>Simulated data</strong>: Real metrics would come from system telemetry (Prometheus, OpenTelemetry) rather than a setInterval.</li>
  <li><strong>In-memory state</strong>: The WebSocket server doesn't persist metrics between restarts. A real system would buffer to a time-series database.</li>
</ul>

<h2>Try It Yourself</h2>

<p>The full source is on GitHub: <a href="https://github.com/sarahanntalley34-collab/SWE">github.com/sarahanntalley34-collab/SWE</a></p>

<p>Demo credentials: <code>admin@demo.com</code> / <code>password123</code></p>

<hr>

<p><em>Retro Engineering is a small, focused team that builds production-quality software. We handle architecture, backend, frontend, and testing — end to end. <a href="/services">See what we do</a>.</em></p>`
  },
  {
    slug: "architecture-decisions-production-saas",
    title: "Architecture Decisions for Production-Grade SaaS",
    date: "2026-07-18",
    excerpt: "Clean architecture isn't a luxury — it's a velocity multiplier. Here's how we think about data modeling, API design, and testing when shipping SaaS products.",
    tags: ["Architecture", "Backend", "Testing"],
    content: `<p>Clean architecture isn't a luxury — it's a velocity multiplier. Every project we take on at Retro Engineering starts with a handful of architectural decisions that pay dividends for the entire lifecycle of the product. Here's how we think about them.</p>

<h2>1. Start with the Data Model</h2>

<p>The fastest way to build the wrong thing is to start with the UI. We start with the data model — what entities exist, how they relate, and what invariants must hold.</p>

<p>For a typical SaaS product, this means:</p>

<ul>
  <li><strong>Users and organizations</strong> — multi-tenancy from day one, even if you only have one customer. Retrofitting it later is painful.</li>
  <li><strong>Roles and permissions</strong> — even a simple enum (admin, member, viewer) avoids a mountain of one-off permission checks later.</li>
  <li><strong>Audit trails</strong> — every mutation gets a <code>created_at</code> and <code>created_by</code>. Storage is cheap; debugging without context is expensive.</li>
</ul>

<p>We use Drizzle ORM for migrations. The schema file is the single source of truth — no generated code, no magic. Just TypeScript objects that map directly to SQL tables.</p>

<h2>2. API Design: Consistency Over Cleverness</h2>

<p>Every API we build follows the same conventions:</p>

<ul>
  <li><strong>RESTful patterns</strong> — <code>GET /api/resource</code>, <code>POST /api/resource</code>, <code>GET /api/resource/:id</code>, <code>PATCH /api/resource/:id</code>, <code>DELETE /api/resource/:id</code></li>
  <li><strong>Consistent error shapes</strong> — <code>{ error: { code: string, message: string } }</code> on every 4xx/5xx</li>
  <li><strong>Pagination by default</strong> — any list endpoint gets <code>?page=1&amp;limit=20</code> with a <code>{ data, total, page, totalPages }</code> response</li>
  <li><strong>Authentication via Bearer tokens</strong> — JWTs with short expiration (24h) and refresh tokens for longer sessions</li>
</ul>

<p>These conventions aren't exciting. That's the point. When every endpoint works the same way, frontend developers move fast and bugs are easier to trace.</p>

<h2>3. Testing Strategy: The Confidence Gradient</h2>

<p>We don't aim for 100% coverage. We aim for confidence. Our testing strategy moves up a gradient:</p>

<p><strong>Unit tests</strong> for pure logic — validation functions, data transformations, authorization checks. Fast, stable, and they catch regressions before anything else runs.</p>

<p><strong>Integration tests</strong> for API endpoints — spin up the server, hit it with real HTTP requests, check the response and database state. These catch the "everything wired together wrong" bugs.</p>

<p><strong>End-to-end tests</strong> for critical flows — the "user signs up and creates their first project" path. We use Playwright for these. They're slower and more brittle, so we keep them focused on the happy paths that absolutely cannot break.</p>

<p>The key insight: if a bug can be caught at a lower level, write the test there. Integration tests shouldn't duplicate unit test coverage. E2E tests shouldn't duplicate integration test coverage.</p>

<h2>4. Monorepo or Multirepo: It Depends on the Team</h2>

<p>For a solo developer or a small team, a monorepo is almost always the right call. One <code>package.json</code>, one <code>tsconfig.json</code>, one CI pipeline. The overhead of multiple repos — versioning, cross-repo PRs, shared config — isn't worth it until you have multiple teams working independently.</p>

<p>When we do use a monorepo, we keep a clean separation:</p>

<pre><code>project/
├── backend/        # API server
├── frontend/       # React app
├── shared/         # Types, validation, constants
└── infra/          # Docker, Terraform, CI config</code></pre>

<p>The <code>shared/</code> package is the contract between frontend and backend. API types, validation schemas, error codes — anything that both sides need to agree on lives here.</p>

<h2>5. Deploy Early, Deploy Often</h2>

<p>We deploy to a staging environment on the first day of a new project. Even if it's just a health check endpoint. This forces us to answer infrastructure questions early — how are secrets managed? What's the CI pipeline? How do we roll back?</p>

<p>By week two, we're deploying to production behind a feature flag. Real users, real data, real feedback — and a safety net if something goes wrong.</p>

<h2>The Bottom Line</h2>

<p>These aren't groundbreaking ideas. They're patterns that we've seen work across dozens of projects. The difference is discipline — actually doing them, consistently, from day one.</p>

<p>The projects that skip these steps don't fail. They just get slower and slower until every feature feels like a fight with the codebase. Clean architecture isn't about being clever. It's about staying fast.</p>

<hr>

<p><em>Retro Engineering helps founders and product teams ship production-quality software. <a href="/contact">Start a project</a> — no obligation, just a conversation about what you're building.</em></p>`
  },
  {
    slug: "small-engineering-teams-ship-faster",
    title: "Why Small Engineering Teams Ship Faster",
    date: "2026-07-15",
    excerpt: "Conventional wisdom says bigger teams deliver more. The data says otherwise. A case for focused, senior-heavy engineering teams with end-to-end ownership.",
    tags: ["Engineering", "Process", "Opinion"],
    content: `<p>Conventional wisdom says bigger teams deliver more. The data says otherwise. Here's why I believe small, senior-heavy engineering teams are the most effective way to build software.</p>

<h2>The Communication Tax</h2>

<p>Every person you add to a team creates communication channels — and those channels grow quadratically. A team of 3 has 3 communication channels. A team of 10 has 45.</p>

<p>This isn't just theory — it plays out in practice every day. Standups get longer. PR reviews involve more stakeholders. Decisions require more meetings. The actual time spent writing code shrinks as the team grows.</p>

<p>Small teams sidestep this entirely. Three engineers who sit in the same Slack channel, review each other's code directly, and make decisions without escalation — they spend most of their time building.</p>

<h2>End-to-End Ownership</h2>

<p>In a large org, work flows through specialization layers: product → design → frontend → backend → QA → ops. Each handoff is a point of friction where context is lost and assumptions diverge.</p>

<p>In a small team, the same person who designs the API writes the tests and deploys to production. There's no "throw it over the wall." If something breaks at 2 AM, the person who wrote it fixes it. This creates a natural incentive for quality — you're accountable for your own work, end to end.</p>

<h2>Senior Focus</h2>

<p>Larger teams inevitably have a mix of experience levels. Senior engineers spend significant time mentoring, reviewing, and course-correcting — work that's valuable but doesn't directly produce features.</p>

<p>A small team of senior engineers has no junior-level drag. Every line of code is written by someone who's already made the mistakes, learned the patterns, and knows when to cut corners and when to be rigorous. Review cycles are faster because the code is cleaner on first pass. Architecture decisions are made once, correctly, because everyone at the table has the experience to spot problems early.</p>

<p>This isn't an argument against hiring juniors — it's an argument for the right team composition for the right project. If you're building a SaaS product from scratch with real revenue on the line, you want experienced builders.</p>

<h2>Predictable Cadence</h2>

<p>Small teams settle into a rhythm quickly. For us, it's:</p>

<ul>
  <li><strong>Monday</strong>: Plan the week's work from a prioritized backlog</li>
  <li><strong>Tuesday-Thursday</strong>: Write code in small, reviewable PRs</li>
  <li><strong>Friday</strong>: Deploy, review metrics, demo to stakeholders</li>
</ul>

<p>There's no sprint planning theater, no cross-team dependency tracking, no "blocked waiting for the other team." Just a clear pipeline from spec to shipped feature, every week.</p>

<h2>The Counterargument</h2>

<p>Small teams have real limits. You can't build three features in parallel. You have a bus factor of one on critical knowledge. And if you lose someone, the impact is outsized.</p>

<p>The mitigation is simple: documentation, pair programming on critical paths, and building systems that are boring enough that anyone can maintain them. We don't build clever code. We build clear code.</p>

<h2>When Bigger Teams Make Sense</h2>

<p>I'm not arguing small teams are always better. If you're maintaining a legacy monolith with 50 services and 200 internal customers, you need more people. If you're a FAANG company operating at planetary scale, you need specialization.</p>

<p>But for the vast middle — the startup building a SaaS product, the internal team shipping a tool, the agency delivering client work — a small, focused team of senior engineers will out-ship a larger team almost every time.</p>

<p>Speed comes from focus, not headcount.</p>

<hr>

<p><em>Retro Engineering is a team of 3 senior engineers. We ship production-quality software — architecture through deployment — without the overhead. <a href="/services">See our services</a> or <a href="/contact">get in touch</a>.</em></p>`
  }
];
