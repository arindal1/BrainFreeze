import type { Metadata } from "next";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";
import "./globals.css";

const SITE_URL = "https://brainfreeze.app";
const SITE_TITLE = "Brain Freeze | Intelligent Asynchronous Research";
const SITE_DESCRIPTION =
  "Submit any research query: a topic, product, company, sector, or trend - and receive a comprehensive, structured markdown document once a multi-agent AI research pipeline finishes in the background. No waiting, no blocking.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s · Brain Freeze",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "AI research assistant",
    "multi-agent AI research",
    "automated research tool",
    "asynchronous research platform",
    "AI research agents",
    "company research AI",
    "market research automation",
    "Gemini research agent",
    "Grok research agent",
    "Nemotron AI",
    "research document generator",
    "Brain Freeze",
  ],
  authors: [{ name: "Arindal Char", url: "https://github.com/arindal1" }],
  creator: "Arindal Char",
  publisher: "Arindal Char",
  applicationName: "Brain Freeze",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Brain Freeze",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Brain Freeze - Intelligent Asynchronous Research" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.svg"],
    creator: "@arindal_17",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Syne (display) / Space Grotesk (text) / Martian Mono (labels).
            Loaded from the Google Fonts CDN rather than next/font so the build
            never depends on font fetches at compile time. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Martian+Mono:wght@300..500&family=Space+Grotesk:wght@300..700&family=Syne:wght@400..800&display=swap"
        />
      </head>
      <body className="flex min-h-full flex-col bg-void text-frost">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}