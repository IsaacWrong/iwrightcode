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

export const metadata: Metadata = {
  metadataBase: new URL("https://iwrightcode.com"),
  title: "iwrightcode_ — Isaac Wright, full-stack developer",
  description:
    "Using AI to drive revenue-multiplying outcomes for founders and small teams.",
  openGraph: {
    title: "iwrightcode_",
    description: "build. ship. repeat.",
    url: "https://iwrightcode.com",
    siteName: "iwrightcode_",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

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
      </body>
    </html>
  );
}
