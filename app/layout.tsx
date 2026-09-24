import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Bricolage_Grotesque } from "next/font/google";
import StructuredData from "@/components/StructuredData";
import {
  SITE_URL,
  SITE_NAME,
  TAGLINE,
  DESCRIPTION,
  KEYWORDS,
  PUBLISHER,
} from "@/lib/seo";
import "./globals.css";

// Emphasis / lead-in voice. Helvetica Neue (display) is a system font,
// and Geist Sans (body) + Geist Mono (data) load from the geist package.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} · ${TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: KEYWORDS,
  authors: [{ name: PUBLISHER.name, url: PUBLISHER.url }],
  creator: PUBLISHER.name,
  publisher: PUBLISHER.name,
  category: "business software",
  alternates: { canonical: "/" },
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
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    title: `${SITE_NAME} · ${TAGLINE}`,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} · ${TAGLINE}`,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#070c0a",
  width: "device-width",
  initialScale: 1,
};

// With JS off, the reveal/entrance animations never fire — force their content
// visible so the whole page is readable without JavaScript. Mirrors the
// prefers-reduced-motion overrides in globals.css.
const NO_JS_CSS = `
.reveal,.reveal-up{opacity:1!important;transform:none!important;transition:none!important}
.stext__u{opacity:1!important;transform:none!important;animation:none!important}
.vs__row,.clxc,.clxc__price,.clxc__coin{opacity:1!important;transform:none!important;animation:none!important}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${bricolage.variable}`}
    >
      <body>
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: NO_JS_CSS }} />
        </noscript>
        {children}
        <StructuredData />
      </body>
    </html>
  );
}
