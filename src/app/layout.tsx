import type { Metadata, Viewport } from "next";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/seo";
import "./globals.css";

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
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    creator: "@arindal_17",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
  // Add Google Search Console / Bing Webmaster verification tokens here once issued,
  // e.g. verification: { google: "...", other: { "msvalidate.01": "..." } }.
};

export const viewport: Viewport = {
  themeColor: "#06070a",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.svg`,
      founder: { "@type": "Person", name: "Arindal Char", url: "https://github.com/arindal1" },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
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
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-void text-frost">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}