import type { NextConfig } from "next";
import path from "path";

const isDev = process.env.NODE_ENV !== "production";

// React dev mode and Turbopack HMR require 'unsafe-eval' for callstack
// reconstruction and fast refresh. Production never uses eval().
//
// Prod keeps 'unsafe-inline' in script-src as a deliberate tradeoff:
// migrating to per-request nonces requires proxy.ts + fully dynamic
// rendering, which would disable static generation and CDN caching
// for `/`. On a static portfolio with no user-generated HTML, no
// auth, and no reflected input, the XSS surface doesn't justify that
// cost. Revisit if dynamic content or sensitive data is introduced.
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  isDev ? "'unsafe-eval'" : null,
  "https://va.vercel-scripts.com",
]
  .filter(Boolean)
  .join(" ");

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src ${scriptSrc}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.github.com https://va.vercel-scripts.com https://vitals.vercel-insights.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
