import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
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
    "Full-stack developer specializing in vertical SaaS, fintech, and AI-native applications.",
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
        {children}
        <CommandLayer />
        <BootSequence />
      </body>
    </html>
  );
}
