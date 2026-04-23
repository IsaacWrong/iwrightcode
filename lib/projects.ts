export type Project = {
  slug: string;
  name: string;
  tagline: string;
  stack: string[];
  status: "shipped" | "building" | "exploring";
  href?: string;
};

export const projects: Project[] = [
  {
    slug: "palm-commissions",
    name: "Palm Commissions",
    tagline:
      "Vertical SaaS for insurance agency commission tracking and reconciliation.",
    stack: ["Next.js", "Supabase", "TypeScript", "Stripe"],
    status: "building",
  },
  {
    slug: "trading-copilot",
    name: "Trading Copilot",
    tagline:
      "AI-native self-directed investing platform. Conversational strategy creation with automated execution.",
    stack: ["Next.js 15", "Vercel AI SDK", "Alpaca", "Inngest"],
    status: "exploring",
  },
  {
    slug: "client-portal",
    name: "Advisor Client Portal",
    tagline:
      "Secure document exchange and policy review tool built for an independent advisory practice.",
    stack: ["Next.js", "Supabase", "DocuSign"],
    status: "shipped",
  },
  {
    slug: "mcp-experiments",
    name: "MCP Experiments",
    tagline:
      "Open-source explorations of the Model Context Protocol for domain-specific agent workflows.",
    stack: ["TypeScript", "Anthropic API", "MCP"],
    status: "exploring",
  },
];
