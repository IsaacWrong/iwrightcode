import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import CommandLayer from "@/components/CommandLayer";
import BootSequence from "@/components/BootSequence";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const SITE_URL = "https://iwrightcode.com";
const SITE_NAME = "iwrightcode_";
const TITLE = "iwrightcode_ — Isaac Wright, full-stack developer";
const DESCRIPTION =
  "Using AI to drive revenue-multiplying outcomes for founders and small teams. Custom software, AI-native delivery, financial-services domain fluency.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · iwrightcode_",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Isaac Wright", url: SITE_URL }],
  creator: "Isaac Wright",
  publisher: "Isaac Wright",
  keywords: [
    "Isaac Wright",
    "iwrightcode",
    "full-stack developer",
    "AI developer",
    "Next.js",
    "TypeScript",
    "Claude Code",
    "Anthropic",
    "Supabase",
    "fractional CTO",
    "contract software development",
    "financial services software",
    "insurance commission tracking",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
  },
  category: "technology",
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Isaac Wright",
    alternateName: "iwrightcode",
    url: SITE_URL,
    image: `${SITE_URL}/opengraph-image`,
    email: "mailto:iwrightcode@gmail.com",
    jobTitle: "Full-stack developer",
    description: DESCRIPTION,
    sameAs: [
      "https://github.com/IsaacWrong",
      "https://www.linkedin.com/company/iwrightcode",
    ],
    knowsAbout: [
      "Next.js",
      "TypeScript",
      "React",
      "Tailwind CSS",
      "Claude Code",
      "Anthropic API",
      "Model Context Protocol",
      "Supabase",
      "PostgreSQL",
      "Financial services software",
      "Insurance technology",
    ],
    knowsLanguage: ["en"],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DESCRIPTION,
    inLanguage: "en-US",
    author: {
      "@type": "Person",
      name: "Isaac Wright",
      url: SITE_URL,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Custom software, AI-native delivery, and fractional technical leadership for founders and small teams.",
    areaServed: "Worldwide",
    provider: {
      "@type": "Person",
      name: "Isaac Wright",
      url: SITE_URL,
    },
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-fg">
        <a
          href="#top"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:bg-fg focus:text-bg focus:font-mono focus:text-[12px] focus:rounded"
        >
          skip to content
        </a>
        {children}
        <CommandLayer />
        <BootSequence />
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
