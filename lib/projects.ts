export type Project = {
  slug: string;
  name: string;
  tagline: string;
  summary?: string;
  stack: string[];
  status: "shipped" | "building" | "exploring";
  href?: string;
};

export const projects: Project[] = [
  {
    slug: "palm-commissions",
    name: "Palm Commissions",
    tagline:
      "Commission tracking for insurance agents. Upload CSV/Excel from any carrier, reconcile earnings, and manage your book of business.",
    summary: "Commission tracking + reconciliation for insurance agents.",
    stack: ["Next.js 15", "Supabase", "Stripe", "PostHog", "Sentry"],
    status: "shipped",
    href: "https://pcommissions.com",
  },
  {
    slug: "rectorfolio",
    name: "Rectorfolio",
    tagline:
      "Social investing platform with an AI co-pilot that creates strategies from natural language, executes trades, and explains every rebalance.",
    summary: "Social investing with a persistent AI co-pilot.",
    stack: ["Next.js 16", "Vercel AI SDK", "Anthropic", "Supabase", "Inngest"],
    status: "building",
  },
  {
    slug: "exit-edge-ai",
    name: "ExitEdge AI",
    tagline:
      "Marketing site and lead engine for a consulting firm helping owner-operated businesses prepare for exit through AI and process engineering.",
    stack: ["Next.js 16", "Anthropic SDK", "Supabase", "Resend"],
    status: "shipped",
    href: "https://exitedgeai.com",
  },
  {
    slug: "autoform",
    name: "Autoform",
    tagline:
      "Internal account-opening automation for a wealth management firm. Multi-step advisor intake routes through Make.com to populate DocuSign packets for client signature.",
    summary: "Account-opening automation for a wealth management firm.",
    stack: ["Next.js 16", "Zod", "Make.com", "DocuSign"],
    status: "shipped",
  },
  {
    slug: "bookcheckr",
    name: "Bookcheckr",
    tagline:
      "AI-powered annuity book-of-business review for financial advisors. Desktop app that surfaces opportunities in under 30 seconds.",
    summary: "Desktop annuity book-of-business review for advisors.",
    stack: ["Electron", "React", "Vite", "Supabase", "Anthropic", "Stripe"],
    status: "shipped",
  },
  {
    slug: "bluegrass-home-services",
    name: "Bluegrass Home Services",
    tagline:
      "Marketing site and quote pipeline for a regional home-services company. Rate-limited quote form with direct-to-inbox delivery.",
    stack: ["Next.js 16", "Resend", "Upstash Redis", "Zod"],
    status: "shipped",
    href: "https://bluegrasshservices.com",
  },
];
