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
    slug: "building-saas-dashboard-two-days",
    title: "How We Built a SaaS Metrics Dashboard in Two Days",
    date: "2026-08-09",
    excerpt: "A real sprint recap: data models, seed data, and API endpoints on day one; stat cards, charts, a searchable users table, and settings on day two. What it takes to ship a working SaaS product in two focused days — and what it proves about small teams.",
    tags: ["Engineering", "Case Study", "Process"],
    content: `<p>Two days. One dashboard. A working SaaS metrics product with MRR tracking, user management, and a settings page — real code, a real database, and tests. Here's how the sprint actually went, what we decided along the way, and what it proves about what a small engineering team can deliver in a short sprint.</p>

<h2>What We Built</h2>

<p>A SaaS metrics dashboard — the kind a founder runs their business on. An overview screen with MRR, active users, and revenue stat cards plus trend charts. A users screen with a searchable, filterable table. A settings screen for profile and billing preferences. Two roles, admin and viewer, each seeing different data and controls.</p>

<p>The stack was deliberately boring: <strong>React</strong> for the frontend, <strong>Hono</strong> for the API, <strong>recharts</strong> for charts, <strong>Tailwind</strong> for styling, and <strong>PostgreSQL</strong> for persistence. Nothing exotic. Every piece is mainstream, well-documented, and easy to extend — which matters more than novelty when the goal is shipping.</p>

<h2>Day 1: Data Models, Seed Data, and API Endpoints</h2>

<p>Day one was backend-heavy. We started with the data model — users, subscriptions, and daily metric snapshots — then seeded the database with realistic customers, plans, and usage history so the charts would actually look alive instead of empty. Then we built the API: metrics, users, and settings endpoints, with validation and consistent response shapes so the frontend never had to guess.</p>

<p>One rule kept us honest: <em>the frontend would work against real endpoints, never mock data.</em> By the end of day one, every screen the frontend needed on day two had a real endpoint returning real data. That single decision is what let two people build the UI in parallel on day two instead of waiting on each other.</p>

<h2>Day 2: The Frontend Rebuild</h2>

<p>Day two was pure frontend. We started with the stat cards and recharts trend charts — the screens a founder opens first — then built the searchable users table, then the settings page, then navigation and a responsive pass across mobile and desktop.</p>

<p>We shipped in small, reviewable slices: one screen at a time, each verified against the live API before moving on. Tests were written alongside the components, not as an afterthought. By the end of the day the dashboard ran end-to-end: log in as admin, watch MRR charts render from live queries, search users, update settings.</p>

<h2>What Made Two Days Possible</h2>

<ul>
  <li><strong>Scope was fixed up front.</strong> No discovery phase, no feature creep. We agreed on the screens and the data before writing any code.</li>
  <li><strong>API-first.</strong> Frontend and backend met at a contract — the endpoints and payloads — instead of in meetings.</li>
  <li><strong>A boring stack.</strong> No novel infrastructure, no framework to fight. Just tools we use daily.</li>
  <li><strong>No handoffs.</strong> Three engineers, one shared goal, one context. No ticket queues, no waiting on another team.</li>
</ul>

<h2>Why This Matters to Founders</h2>

<p>Two days is not enough for a complex product, and we would never pretend otherwise. But this sprint shows something important: for a well-scoped build, a small team of senior engineers can go from zero to a deployable, demoable product in days, not months. The bottleneck is almost never engineering capacity — it's scope discipline and decision speed.</p>

<p>When you're evaluating a team, don't count heads. Ask how fast they can turn a fixed scope into something you can click — then click it.</p>

<hr>
<p><em>Retro Engineering is a team of 3 senior engineers. See the result yourself — <a href="/demo">try the live demo</a> — or <a href="/services">see our services</a>.</em></p>`,
  },
  {
    slug: "engineering-team-vs-freelancer",
    title: "When to Hire an Engineering Team vs. a Freelancer",
    date: "2026-08-09",
    excerpt: "Freelancers are cheaper per hour; teams ship more per week. A practical breakdown of what each option actually buys you, when one clearly beats the other, and the questions to ask before you hire.",
    tags: ["Hiring", "Founders", "Freelance"],
    content: `<p>You need software built. The question is who builds it: a freelancer or a small engineering team. Both can be excellent, and both can burn your budget. The mistake founders make is choosing on hourly rate when the real difference is in the <em>shape</em> of what each option can deliver.</p>

<h2>What a Freelancer Is Genuinely Good At</h2>

<p>A good freelancer is a specialist. Hire one when the work is well-defined and bounded: a landing page, a specific integration, a data migration, a fix. They can start fast, the cost is predictable, and for a single clear deliverable they are often the right call.</p>

<p>Freelancers struggle when the work is broad or long-lived. One person is a single point of failure — if they get busy, go quiet, or move on, you lose context and momentum. And most freelancers are either generalists or narrow specialists; getting architecture, backend, frontend, and testing all at senior depth from one person is rare.</p>

<h2>What a Small Team Is Genuinely Good At</h2>

<p>A small engineering team — say three senior engineers — covers the full stack at depth and keeps moving even when one person is out. Code review is built into the process, not skipped. Architecture decisions get made deliberately. Tests are part of the work, not a luxury. You get a cadence: spec, build, review, ship, every week.</p>

<p>The honest trade-off is cost and flexibility. A team costs more per hour and is harder to scale down to nothing. Teams make sense when the work is a <em>product</em> — something with a backend, a frontend, users, and a future — rather than a task.</p>

<h2>The Real Difference: Delivery Shape</h2>

<p>Put both on a typical SaaS feature: auth, a data model, a few API endpoints, and a UI. The freelancer quotes fewer hours at a lower rate. But those hours are serial — the UI waits for the API, which waits for the schema. A team runs backend and frontend in parallel against an agreed contract, reviews each other's work, and ships the whole slice at once.</p>

<p>That is why "cheaper per hour" and "cheaper overall" are different questions. If the freelancer takes six weeks and the team takes two, the team can win on total cost even at double the rate — before you count the value of your own time spent project-managing the work.</p>

<h2>Questions to Ask Yourself</h2>

<ul>
  <li><strong>Is the scope bounded?</strong> One clear deliverable points to a freelancer. An evolving product points to a team.</li>
  <li><strong>What happens if this person disappears next month?</strong> If losing them stalls everything, you have built a risk, not a product.</li>
  <li><strong>Do you need review and testing, or just working code?</strong> For production software, you need both.</li>
  <li><strong>How fast do you need the whole thing, not the first piece?</strong> Parallel work is where teams earn their premium.</li>
</ul>

<h2>The Mixed Model</h2>

<p>These aren't either/or forever. Many teams bring in freelancers for spikes of work — a specialist integration, a design pass, extra hands on a deadline. And teams can take over and maintain what a freelancer shipped. The worst outcome is the reverse: a freelancer inheriting a team-built codebase with no context, or a team untangling five freelancers' divergent styles.</p>

<h2>The Bottom Line</h2>

<p>Hire a freelancer for a job. Hire a team for a product. If you're not sure which you have yet, that uncertainty itself is a signal — you likely want a team that can carry you through the ambiguous early phase and hand off cleanly when the shape of the work changes.</p>

<hr>
<p><em>Retro Engineering is a team of 3 senior engineers shipping production software end-to-end. <a href="/services">See our services</a> or <a href="/contact">get in touch</a>.</em></p>`,
  },
  {
    slug: "mvp-cost-2026",
    title: "How Much Does an MVP Really Cost in 2026?",
    date: "2026-08-09",
    excerpt: "Honest price ranges for a real MVP in 2026: what drives cost up and down, where founders waste the most money, and how to scope a first version that is actually shippable.",
    tags: ["MVP", "Budgeting", "Founders"],
    content: `<p>"How much does an MVP cost?" is the first question most founders ask, and the answer depends entirely on who is answering. Agencies quote project prices. Freelancers quote hourly. Nobody quotes the number you actually need: what does a <em>shippable</em> first version cost, honestly, in 2026? Here are real ranges and what moves them.</p>

<h2>First, What Counts as an MVP</h2>

<p>An MVP is one user flow, end to end: someone signs up, does the core thing your product exists for, and gets value — on production infrastructure. It is not a feature list, and it is not a polished prototype. If a human has to babysit it, it doesn't count as built.</p>

<h2>Honest Ranges in 2026</h2>

<ul>
  <li><strong>$5,000–$15,000 — Simple CRUD app.</strong> A few screens, a database, basic auth, deployed. Good for internal tools and single-workflow products.</li>
  <li><strong>$15,000–$40,000 — SaaS MVP.</strong> Multi-user accounts, real auth, payments (Stripe or similar), a dashboard, email, basic admin. This is the band most B2B SaaS founders should plan for.</li>
  <li><strong>$40,000–$100,000+ — Complex domain or heavy integrations.</strong> Marketplace logic, real-time systems, compliance requirements, or deep third-party integrations. If your MVP needs a rules engine, expect this.</li>
</ul>

<p>These are ranges for an actual team with review and testing. A solo freelancer can land at the low end; a large agency will often exceed the top. Both are legitimate choices — just don't compare a freelancer's quote for "the screens" against a team's quote for "the product."</p>

<h2>What Drives Cost Up</h2>

<ul>
  <li><strong>Scope.</strong> The single biggest driver. Every extra user role, workflow, and integration multiplies the work.</li>
  <li><strong>Auth and billing done properly.</strong> Stripe checkout is easy; handling failed payments, proration, and account security is not.</li>
  <li><strong>Integrations.</strong> Each third-party system is a small project of its own — documentation, edge cases, failure handling.</li>
  <li><strong>Tests and security basics.</strong> Production software needs both. Skipping them makes the MVP cheaper and the relaunch much more expensive.</li>
  <li><strong>Unclear requirements.</strong> Rework is the most expensive thing in software. Decisions made late cost more than decisions made wrong.</li>
</ul>

<h2>Where Founders Waste Money</h2>

<ul>
  <li>Polishing features nobody has validated. A beautiful settings page for a feature users don't want is pure cost.</li>
  <li>Design overkill on day one. A clean, consistent UI beats a bespoke design system at MVP stage.</li>
  <li>Building "scalable" infrastructure for ten users. Kubernetes is not an MVP feature.</li>
  <li>Switching teams mid-build. The most expensive sentence in software is "let's start over with a new team."</li>
</ul>

<h2>How to Keep an MVP Honest</h2>

<ul>
  <li><strong>Cut until one workflow remains.</strong> If you can't describe your MVP as one sentence, it's two MVPs.</li>
  <li><strong>Name the decider.</strong> The person who answers product questions within hours, not days.</li>
  <li><strong>Plan for the next iteration, not the IPO.</strong> The best MVP is the one you're happy to throw away.</li>
</ul>

<h2>The Number You Should Actually Track</h2>

<p>Cost per learning is the metric that matters. An MVP is cheap if it tells you what to build next; expensive if it tells you nothing. Spend to answer your riskiest question, whatever it costs — and no more.</p>

<hr>
<p><em>Retro Engineering builds MVPs from $7,500 with a fixed scope and a defined timeline. <a href="/services">See our services</a> or <a href="/contact">talk to us about your budget</a>.</em></p>`,
  },
  {
    slug: "saas-code-audit-signs",
    title: "Signs Your SaaS Needs a Code Audit",
    date: "2026-08-09",
    excerpt: "Seven technical-debt red flags any non-technical founder can spot — and what a code audit actually costs and finds.",
    tags: ["Code Quality", "Technical Debt", "SaaS"],
    content: `<p>You can't read your codebase, but you can read its symptoms. Technical debt rarely announces itself in code — it shows up in how your product behaves and how slowly your team moves. Here are the signs your SaaS needs an independent code audit, written for founders who will never open a pull request.</p>

<h2>1. Every Feature Takes Longer Than the Last</h2>

<p>The healthy benchmark is steady delivery: a similar-size feature takes a similar amount of time. If the same work keeps slipping, the code is fighting the team. Features that used to be two days now take a week, with fixes breaking other things. That's the classic signature of accumulated debt.</p>

<h2>2. Deploys Are Scary</h2>

<p>If shipping involves a prayer, a checklist of manual steps, and a rollback plan, your pipeline is carrying too much risk. Deploys should be routine — small, frequent, and reversible. A team that dreads releasing will release less, and a product that ships less falls further behind.</p>

<h2>3. "That's Legacy" Applies to Core Logic</h2>

<p>Some legacy code is fine. When the code handling money, authentication, or your core workflow is the code nobody wants to touch, that's a problem. Your most important business logic should be your most reviewed, best-tested code — not the code everyone is afraid of.</p>

<h2>4. Security Basics Are Missing</h2>

<p>A few signals any founder can check: no rate limiting on login (brute-force target), API keys or database credentials sitting in the repository, an admin panel with no extra protection, or payment code that nobody has reviewed. An audit will find these — better to find them before someone else does.</p>

<h2>5. There Are No Tests</h2>

<p>If a change to one feature breaks another and nobody knows until users complain, your codebase has no safety net. A healthy project has tests around the money paths, the auth flow, and the core workflow. Without them, every release is a gamble.</p>

<h2>6. One Person Holds the Keys</h2>

<p>If losing one engineer would freeze the product, you don't have a team, you have a hostage situation. Bus factor one is fine in a prototype and dangerous in a product. An audit will show how much knowledge lives only in one head.</p>

<h2>7. Your Integrations Break Silently</h2>

<p>Payments, email, webhooks — if failures only surface when a customer emails support, your error handling is missing. Reliable software fails loudly, with an alert and a log entry.</p>

<h2>What an Audit Actually Costs and Finds</h2>

<p>A focused audit of a typical SaaS codebase runs one to two weeks and typically lands between $1,000 and $5,000 depending on size. What you get is not a wall of complaints — it's a prioritized list: what's urgent (security, data integrity), what's cheap to fix now (a few hours each), and what's fine to leave alone for years. Most audits find one or two urgent items and a long tail of "fix when you touch it anyway."</p>

<h2>Audits Are Not an Indictment</h2>

<p>Technical debt is normal — every product with users has some. The problem isn't that debt exists; it's that nobody knows where it is or how bad it is. An audit converts vague anxiety into a concrete list, which is exactly what you need to plan the next few months of engineering.</p>

<p>If two or three of the signs above feel familiar, get a second opinion on the code before you pour more money into it.</p>

<hr>
<p><em>Retro Engineering offers a <a href="/services">Technical Audit</a> — one week, a prioritized report, and no obligation to hire us afterward. <a href="/contact">Get in touch</a>.</em></p>`,
  },
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
  },
  {
    slug: "what-to-expect-two-week-engineering-sprint",
    title: "What to Expect from a Two-Week Engineering Sprint",
    date: "2026-08-06",
    excerpt: "A practical guide to the decisions, deliverables, and collaboration that make a focused two-week engineering sprint useful for founders and product teams.",
    tags: ["Engineering", "Sprints", "Process"],
    content: `<p>A two-week engineering sprint is a short, focused engagement built around one clearly defined outcome. It is not a compressed version of an entire product build, and it is not two weeks of disappearing engineers. Done well, it gives you a working slice of product, a clearer technical path, and a realistic basis for deciding what to do next.</p>

<h2>What Is an Engineering Sprint—and When Does It Make Sense?</h2>

<p>A sprint brings a small engineering team around a bounded problem: for example, shipping an onboarding flow, connecting a payment provider, or turning a validated workflow into a usable internal tool. The scope is agreed before the clock starts, and the team works in short feedback loops so there are fewer surprises at the end.</p>

<p>It can be a good fit when you have a specific feature or risk to address, a product direction that is clear enough to test, or a team that needs experienced engineering capacity without making a permanent hire. It is also useful when you want to evaluate how a team communicates and ships before committing to a longer engagement.</p>

<p>A sprint is different from hiring full-time. A full-time hire makes sense when engineering is a continuing core capability, you have enough ongoing work to support the role, and you are prepared to invest in recruiting, onboarding, management, and team development. A sprint is more appropriate when the need is immediate and scoped, or when you are still learning what the product requires. It can provide evidence for a later hiring decision, but it should not be used to avoid making that decision indefinitely.</p>

<h2>Week 1: Architecture, Spec, and Setup</h2>

<p>The first week is about reducing ambiguity before we build. That does not mean spending five days in meetings. It means asking the questions that are cheaper to answer on paper than in code.</p>

<p>We start by clarifying the user problem, the success condition, and what is explicitly out of scope. We review any existing product, designs, data model, and constraints. Then we choose an implementation approach that fits the problem rather than reaching for the most elaborate architecture available.</p>

<p>By the middle of the week, you should have a concise implementation plan: the user flow, key technical decisions, known risks, assumptions, and a set of small, reviewable tasks. If a requirement is unclear or the proposed outcome is too large for two weeks, we say so and help narrow it.</p>

<p>In parallel, we set up the working environment. That may include repository access, local development, deployment environments, authentication, database migrations, third-party credentials, and a basic test and review workflow. We prefer to expose setup problems early, while there is still time to solve them.</p>

<p>By the end of week one, the client should have an agreed scope and definition of done, an architecture and delivery plan, a running development setup, and—where practical—a first thin slice or technical proof that validates the riskiest assumption. You should understand what will be built in week two and why.</p>

<h2>Week 2: Build, Review, and Ship</h2>

<p>With the path clear, week two is for implementation. We build in small increments rather than waiting for one large handoff. That gives you something concrete to review and gives us a chance to correct misunderstandings while they are still inexpensive.</p>

<p>Expect working software, not just screenshots. Depending on the scope, that could include a responsive interface, API endpoints, data persistence, integrations, validation, error states, and tests around the important behavior. We keep the code in version control and make decisions visible through pull requests and short written updates.</p>

<p>Review is part of the build, not a ceremony at the end. We check the work against the agreed acceptance criteria, address edge cases, and leave room for a client review or demo. Before shipping, we verify the production path, document any configuration steps, and deploy to the agreed environment. The handoff should include the code, a summary of what changed, notes on anything deliberately deferred, and a sensible next-step backlog.</p>

<h2>Realistic Outcomes: What a Sprint Can—and Cannot—Do</h2>

<p>A good sprint can deliver one meaningful, production-ready slice; remove a high-risk technical unknown; establish a maintainable foundation; or turn a loose idea into software that users can react to. It can also give stakeholders a much better estimate for the next phase because the estimate is based on evidence rather than optimism.</p>

<p>It cannot deliver an entire mature SaaS product in two weeks. It will not resolve every product question, build every integration, or guarantee traction. Some work—security hardening, accessibility review, performance tuning, operational monitoring, content, and additional user research—may need to follow the initial release. Being explicit about those boundaries is a sign of good planning, not a lack of ambition.</p>

<h2>How to Prepare as a Client</h2>

<p>You do not need a perfect technical specification. You do need enough product context to make decisions quickly. Bring a clear description of the user and problem, examples of the current workflow, and a definition of what success looks like. A rough sketch or existing prototype is often more useful than a long document.</p>

<p>Before the sprint begins, identify the person who can answer product questions and approve tradeoffs. Gather repository, hosting, database, analytics, and third-party service access. Confirm who owns the relevant accounts and how credentials will be shared securely. If there are designs, brand guidelines, legal constraints, or data-handling requirements, make those available up front.</p>

<p>Finally, protect time for feedback. A sprint moves quickly because decisions do too. A short daily check-in or prompt response to a focused question can prevent a day of rework. The best client contribution is not micromanaging implementation; it is being available to clarify priorities and review the result.</p>

<h2>A Sprint Should Make the Next Decision Easier</h2>

<p>The point of a two-week sprint is not to create artificial urgency. It is to create useful momentum with clear boundaries. At the end, you should know what works, what shipped, what remains, and what the next investment should be.</p>

<p>If you have a well-scoped feature or technical problem you want to move from “we should” to working software, <a href="/services">see our services</a>. We can talk through whether a sprint is the right shape for the work—and if it is not, we will say that plainly.</p>`
  },
  {
    slug: "small-teams-ship-better-software",
    title: "Why Small Teams Ship Better Software",
    date: "2026-08-10",
    excerpt: "Amazon's two-pizza rule isn't folklore — it's physics. Smaller teams communicate faster, own more of the stack, and ship working software while larger teams are still scheduling meetings. Here's why small engineering teams consistently outperform their larger counterparts, and what it means for founders building SaaS products.",
    tags: ["Engineering", "Process", "Startups"],
    content: `<p>There is a persistent myth in software that bigger teams ship faster. The logic sounds reasonable: more people, more output. But anyone who has worked on both sides knows the truth: after a surprisingly low threshold, adding engineers slows you down.</p>

<p>Amazon institutionalized this as the two-pizza rule — no team should be larger than what two pizzas can feed. The reason is not about pizza. It is about communication overhead, ownership, and the physics of coordination.</p>

<h2>The Math of Communication</h2>
<p>Every person you add to a team creates new communication channels. A team of three has three one-to-one relationships. A team of six has fifteen. A team of ten has forty-five. Each channel is a potential misalignment — a decision that needs to be synchronized, a dependency that blocks someone, a meeting that burns an afternoon.</p>

<p>Small teams do not escape communication overhead — they just keep it below the threshold where it consumes more time than building. When a team is small enough that everyone can fit in one room and one conversation, decisions happen in seconds instead of days.</p>

<h2>Full-Stack Ownership</h2>
<p>On a large team, specialization is necessary. One person owns the database schema. Another owns the API layer. A third owns the frontend components. This creates handoffs — the single most expensive transaction in software development.</p>

<p>On a small team, one engineer owns a feature end-to-end: database, API, frontend, tests, deployment. There are no handoffs because there is nobody to hand off to. The loop from idea to working software is measured in hours, not sprint cycles.</p>

<p>This is not about individual heroics. It is about reducing coordination cost to zero within a feature. When the person writing the React component also wrote the endpoint it calls and designed the table it reads from, they do not need a spec document to align with themselves.</p>

<h2>Code Quality Improves</h2>
<p>Counterintuitively, small teams often produce higher-quality code. Not because they are better engineers — because they feel the consequences of their decisions immediately.</p>

<p>On a large team, the person who designs a bad API might never see the frontend code that suffers from it. The feedback loop is broken. On a small team, you write a bad abstraction at 10 AM and you are cursing yourself by 2 PM. The pain is immediate and personal, so you learn faster and build better.</p>

<p>Code review on a small team is also more effective. When every reviewer understands the full system, they catch architectural issues that a specialist reviewer would miss. They know which part of the system this change will ripple into because they built that part too.</p>

<h2>Velocity Without Burnout</h2>
<p>There is a difference between working fast and working long. Small teams work fast because they remove the friction between steps — not because they work more hours. A feature that takes two weeks on a large team, with three handoffs and four review cycles, takes three days on a small team where one person owns the whole thing.</p>

<p>This does not mean small teams never burn out — they can and they do. But the burnout comes from scope, not from coordination tax. And scope is something you can control.</p>

<h2>What This Means for Founders</h2>
<p>If you are building a SaaS product, resist the instinct to scale the team when things feel slow. The thing making you slow is more likely coordination overhead than a shortage of engineers. A small, focused team that ships end-to-end will outpace a larger team that spends half its time aligning.</p>

<p>At <a href="/">Retro Engineering</a>, this is the whole model. A small team. Full-stack ownership. No handoffs. We ship production-quality software — architecture through deployment — in sprints measured in days, not months.</p>

<p>If you are tired of large-team overhead and want to see what a small, focused team can deliver, <a href="/services">take a look at how we work</a>. We would rather show you shipped code than a project plan.</p>`
  },
  {
    slug: "when-saas-needs-technical-audit",
    title: "When Does Your SaaS Need a Technical Audit?",
    date: "2026-08-10",
    excerpt: "Slow deploys, mysterious outages, a codebase nobody wants to touch — these are the signs your SaaS has accumulated technical debt that is quietly taxing every feature you ship. Here's how to recognize when an audit is worth the cost, what a good one covers, and what it should hand you at the end.",
    tags: ["Engineering", "Audit", "Startups"],
    content: `<p>Every SaaS starts with good intentions. The first feature ships fast. The second ships faster. Then the third one takes twice as long, the fourth one introduces a bug that takes a week to find, and suddenly the codebase is something you dread opening. This is not a failure of effort. It is accumulated technical debt — and it has a cost you can measure.</p>

<h2>The Signs That You Need an Audit</h2>
<p>How do you know the debt is actually costing you? Look for these patterns:</p>

<ul>
<li><strong>Deploys that used to take minutes now take an afternoon.</strong> Every release is a gamble, and the rollback script gets more use than the feature.</li>
<li><strong>Onboarding a new engineer takes weeks.</strong> If the architecture is only in someone's head, knowledge transfer is the bottleneck — and it walks out the door when that person leaves.</li>
<li><strong>Bugs cluster in the same modules.</strong> High bug density in a small area of code is a signal the design is fighting the requirements, not serving them.</li>
<li><strong>Features get slower to ship even though the team is getting more experienced.</strong> That is the purest measure of debt: velocity declining against a fixed team.</li>
<li><strong>Tests are a second-class citizen.</strong> No test coverage, flaky tests, or a test suite nobody runs. The safety net is gone and nobody is admitting it.</li>
</ul>

<p>If two or more of these sound familiar, an audit is probably cheaper than the debt is.</p>

<h2>What a Good Audit Covers</h2>
<p>A technical audit is not a code review of everything you have ever written. It is a structured assessment with a clear scope. A serious one covers four areas:</p>

<p><strong>Architecture.</strong> Are the boundaries between frontend, backend, and database clean? Can you swap a third-party service without rewriting everything? Is the data model shaped for the way the product is actually used — or for how you imagined it in month one?</p>

<p><strong>Security and data integrity.</strong> Auth, authorization, secrets management, input validation, dependency vulnerabilities. This is the area where "we'll fix it later" has the worst odds, because later never comes until the breach does.</p>

<p><strong>Operational health.</strong> Logging, error tracking, monitoring, backups, deploy pipeline, rollback story. A system nobody can observe is a system nobody can operate — and it will fail at 3 AM, alone.</p>

<p><strong>Code quality and test coverage.</strong> Not style nitpicks — structural quality. Duplicated logic, god objects, missing abstractions, and the test coverage that would let you refactor safely.</p>

<h2>What You Should Get Back</h2>
<p>An audit's value is only as good as what it hands you. A good audit ends with:</p>

<ul>
<li><strong>A prioritized findings list.</strong> Every issue ranked by severity and by the cost of fixing it now versus later. You should be able to work the list top-down and see the risk drop as you go.</li>
<li><strong>Quick wins.</strong> The ten small fixes that eliminate whole classes of problems in a day.</li>
<li><strong>A roadmap.</strong> The structural work, sequenced so nothing you fix gets undone by the next thing you build.</li>
<li><strong>An honest risk assessment.</strong> Including the uncomfortable part — which of your systems would hurt most if they failed, and how likely that is.</li>
</ul>

<h2>When It's Not Worth It</h2>
<p>Honesty cuts both ways. If you are pre-revenue and shipping your first version, you probably do not need an audit — you need momentum, and an audit would mostly tell you things you already know. Audits earn their keep when the product is working, users depend on it, and the team is trying to accelerate on top of a foundation that is slowing them down.</p>

<h2>The Real Cost Question</h2>
<p>Ask not "what does an audit cost?" but "what is the debt costing every month?" If the answer to the second question is bigger than the first, the decision makes itself. Most founders we talk to can feel the tax in their roadmap before they can name it — the audit is what turns the feeling into a number, and the number into a plan.</p>

<p>At <a href="/">Retro Engineering</a> we run <a href="/services">technical audits</a> as a fixed-scope engagement — a focused look at architecture, security, operations, and code quality, ending with a prioritized findings list you can act on. We will also tell you plainly if we do not think you need one yet.</p>`
  },
  {
    slug: "engineering-retainer-after-launch",
    title: "Your SaaS Doesn't End at Launch — Why Founders Keep an Engineering Retainer",
    date: "2026-08-10",
    excerpt: "Launch day is the start, not the finish line: bugs, small features, dependency updates, and uptime never stop. A practical look at what running software after launch actually takes — and why a monthly retainer beats both hiring and letting the product rot.",
    tags: ["Retainer", "Founders", "Maintenance"],
    content: `<p>Every founder knows the launch-day feeling: the product is live, the first customers are in, and the team that built it is about to disband. What most founders underestimate is that the work is only beginning. Software that is used gets bugs filed against it, browsers and dependencies move underneath it, and every new customer pushes a system that was built for zero of them.</p>
<p>The question is not whether your SaaS needs engineering after launch — it does, continuously — but how you get it without overpaying for a full team or gambling on a freelancer who vanishes in a month. This is the case for the engineering retainer, and it is more honest than it sounds.</p>
<h2>What Running Software Actually Costs</h2>
<p>Once a product has users, the work splits into four streams that never go dry:</p>
<ul>
<li><strong>Keeping it alive.</strong> Uptime, error monitoring, performance, security patches, dependency updates. This is the unglamorous 40% of post-launch work that has no feature attached to it and no demo to show — until the night the site goes down.</li>
<li><strong>Small, urgent changes.</strong> The Stripe webhook that needs a new event type, the export that breaks for one customer's timezone, the copy fix that has legal implications. Each one is a half-day task that would take you a week to ramp up on.</li>
<li><strong>Steady incremental features.</strong> The roadmap after v1: integrations, admin tooling, the settings screen customers keep asking for. This is where a product either compounds or stalls.</li>
<li><strong>Technical debt you can no longer ignore.</strong> The hacks that got you to launch now cost you a feature every sprint. Someone has to pay that down, and doing it between customer fires is the only way it ever happens.</li>
</ul>
<p>None of these are optional. The only real choice is who does them.</p>
<h2>Why Not Hire?</h2>
<p>A full-time engineer is the right answer for some companies — roughly the ones with enough sustained work to fill forty hours a week, every week, forever. Most early SaaS products do not have that yet. They have eight hours of real work this week and twenty next month, plus a production system that cannot be left unattended in between. Hiring for that means either overstaffing or under-using someone, and the cost of a senior engineer's salary, equity, and onboarding usually exceeds the value of the work until revenue is far past that point.</p>
<h2>Why Not a Per-Project Freelancer?</h2>
<p>Per-project engagements are great for well-defined chunks of work, and we run plenty of them. But post-launch maintenance is not well-defined. It arrives as a queue of small, unrelated, time-sensitive items that require context on your codebase that a fresh freelancer does not have — and every new freelancer spends your budget learning what the last one knew. The cost is not the hourly rate; it is the repeated onboarding, the context loss, and the fact that the person who responds fastest to a 3 AM outage is usually the one who already knows the system.</p>
<h2>What a Retainer Actually Buys</h2>
<p>A retainer is not a subscription to have an engineer on call — it is a commitment that a specific team holds context on your product for as long as you need it:</p>
<ul>
<li><strong>Continuity.</strong> The same engineers who built it (or who audited it) keep the context: how the data flows, where the sharp edges are, which tests actually protect you.</li>
<li><strong>Priority.</strong> Your issues sit in a queue you share with other retainer clients, but you have a guaranteed slice of capacity every month — no cold-start ramp, no \"I'll start next week\".</li>
<li><strong>Bounded cost.</strong> A fixed monthly number you can plan around, instead of invoices that spike with every incident.</li>
<li><strong>Honest scoping.</strong> Good retainers cap the chaos: if a month's work exceeds the retainer, you find out before the invoice does, not after.</li>
</ul>
<h2>What a Good Retainer Relationship Looks Like</h2>
<p>The best retainer arrangements run on a simple rhythm. A standing queue where you file work as it comes up. A weekly or biweekly check-in where the team triages: what is urgent, what is deferred, what is quietly becoming debt. A monthly summary that shows what shipped and what is next. The goal is that you never have to think about engineering operations — you think about your product, and the queue is always moving.</p>
<p>That is the real product a retainer sells: not hours, but <em>removal of the operational tax</em> — the tax every live product pays in attention, context, and late-night pages. Whether you pay it to a team that knows your code, or in repeated ramp-ups and incident bills, you pay it either way.</p>
<hr>
<p><em>At <a href="/">Retro Engineering</a> we offer an <a href="/services">engineering retainer</a> — a fixed monthly engagement for maintenance, small features, and keeping your product healthy after launch. If you are pre-launch, this post is probably not for you yet; come back when the product has users, because that is exactly when it starts to matter.</em></p>`,
  },

  {
    slug: "first-week-with-engineering-team",
    title: "What Happens in Your First Week with a Small Engineering Team",
    date: "2026-08-10",
    excerpt: "Hiring an engineering team is a leap of faith — so here's exactly what the first week should look like, day by day. The kickoff, the first deployable slice, the code review you can actually read, and the red flags to watch for.",
    tags: ["Process", "Founders", "Hiring"],
    content: `<p>When you hand a product idea to an outside engineering team, you are making a bet: that they will turn your vague understanding of a problem into working software, on a schedule, without you having to babysit. That bet is a lot easier to make when you know what the first week should look like. Here is the shape of a good first week with a small, senior team — and the signs that it is going badly.</p>
<h2>Day 0: Kickoff Is About Scope, Not Small Talk</h2>
<p>The kickoff should end with a written spec, not a handshake. By the end of day one you should have: a plain-language description of what will be built, what is explicitly out of scope, the data the product needs to store, and the definition of done for the first slice. If the team pushes back on scope during kickoff, that is a good sign — senior engineers argue about scope because they have been burned by scope creep. If they agree to everything without questions, be suspicious.</p>
<h2>Day 1–2: The First Deployable Slice</h2>
<p>The fastest way to test an engineering relationship is to demand a small, real, deployable result early. Not a design mockup — a working slice: an endpoint returning real data, a page rendering real content, a build that runs. If the team can deliver a genuine pull request within the first two days, the rest of the engagement is likely to move at the same pace. If they cannot, the problems only compound.</p>
<p>A good first PR has three properties. It is small enough to review in one sitting. It has tests or at least a documented verification path. And the code is readable by someone who did not write it — because the person reviewing it will be you, or your technical advisor, or whoever inherits the codebase.</p>
<h2>Mid-Week: Code Review You Can Read</h2>
<p>By the middle of the first week you should have seen a pull request, a diff, and a review. This matters more than the code itself: it is proof the team follows a process you can audit. Look for meaningful review comments — questions about edge cases, suggestions about structure — not a rubber-stamp approval. The quality of the review conversation tells you more about the team than their portfolio ever will.</p>
<h2>By Friday: What You Should Have</h2>
<ul>
<li><strong>A running build</strong> — something you can open in a browser, click, and break.</li>
<li><strong>A review trail</strong> — every change landed through a pull request with comments, so the history is auditable.</li>
<li><strong>A test story</strong> — at minimum, the critical paths covered; at best, a CI run you can watch.</li>
<li><strong>A plan for week two</strong> — the spec revised with what was learned, sequenced into the next slices.</li>
<li><strong>An honest status report</strong> — including what did not go as planned. A team that only reports wins is not reporting.</li>
</ul>
<h2>Red Flags</h2>
<p>Watch for these in the first week: no pull requests by day three, code that cannot be run outside their machine, zero tests, communication that only happens when you ask, or scope that quietly expands without a conversation. Any one of these is survivable; two is a pattern.</p>
<p>None of this requires you to be technical. It requires you to hold the team to visible, incremental, reviewable work — and a good team will welcome that, because it protects them too.</p>
<hr>
<p><em>At <a href="/">Retro Engineering</a> we work exactly this way: scoped sprints, small PRs, real reviews, and a deployable slice in the first days. <a href="/demo">Try our live demo</a> to see the kind of product we ship, or <a href="/services">see our services and pricing</a>.</em></p>`,
  },

];
