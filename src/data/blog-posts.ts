export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  content: string; // markdown-ish, will be rendered later
}

export const blogPosts: BlogPost[] = [
  {
    slug: "real-time-metrics-dashboard-websockets-neon",
    title: "How We Built a Real-Time Metrics Dashboard with WebSockets and Neon",
    date: "2026-07-20",
    excerpt: "A technical deep-dive into building a live-updating dashboard — from WebSocket architecture and JWT auth to role-based views and real-time data streaming.",
    tags: ["React", "WebSocket", "PostgreSQL", "TypeScript"],
    content: "Coming soon"
  },
  {
    slug: "architecture-decisions-production-saas",
    title: "Architecture Decisions for Production-Grade SaaS",
    date: "2026-07-18",
    excerpt: "Clean architecture isn't a luxury — it's a velocity multiplier. Here's how we think about data modeling, API design, and testing when shipping SaaS products.",
    tags: ["Architecture", "Backend", "Testing"],
    content: "Coming soon"
  },
  {
    slug: "small-engineering-teams-ship-faster",
    title: "Why Small Engineering Teams Ship Faster",
    date: "2026-07-15",
    excerpt: "Conventional wisdom says bigger teams deliver more. The data says otherwise. A case for focused, senior-heavy engineering teams with end-to-end ownership.",
    tags: ["Engineering", "Process", "Opinion"],
    content: "Coming soon"
  }
];
