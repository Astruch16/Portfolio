import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Navigation } from "@/components/layout/navigation";
import { MotionProvider } from "@/components/motion/motion-provider";
import { site } from "@/data/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description:
    "Adam Struch is a design engineer and developer in British Columbia, building and shipping web and mobile products end to end.",
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.role}`,
    description:
      "Design engineer and developer. I build things for the internet.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    description:
      "Design engineer and developer. I build things for the internet.",
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  // Matches the cream surface so the browser chrome never flashes white.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f0eb" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // `data-surface` on the root establishes the default token set; each
    // section overrides it for its own environment.
    <html
      lang="en"
      data-surface="light"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        {/* The hero writes itself out on load, which means its characters start
            at zero opacity. Without JavaScript nothing would ever release them,
            so show the finished text instead. */}
        <noscript>
          <style>{`.type-line > span { opacity: 1 !important; }`}</style>
        </noscript>
      </head>
      <body className="bg-bg text-fg">
        <a
          href="#main"
          className="label sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:bg-fg focus:px-4 focus:py-3 focus:text-bg"
        >
          Skip to content
        </a>
        <MotionProvider>
          <Navigation />
          <main id="main">{children}</main>
        </MotionProvider>
        <div aria-hidden className="grain" />
      </body>
    </html>
  );
}
