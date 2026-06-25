import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import SiteChrome from "@/components/SiteChrome";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

// Configure base URL (change this to your production domain when live)
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://christianlyrics.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Christian Lyrics | Praise, Worship & Communion Songs",
    template: "%s | Christian Lyrics",
  },
  description:
    "Search and browse Christian worship, praise, communion, and festival song lyrics by alphabet, language, category, and artist.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Christian Lyrics",
    title: "Christian Lyrics | Praise, Worship & Communion Songs",
    description:
      "Find and read Christian praise, worship, and communion lyrics in English and regional Indian languages. Search alphabetically, by category, or theme.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Christian Lyrics | Praise, Worship & Communion Songs",
    description:
      "Find and read Christian praise, worship, and communion lyrics in English and regional Indian languages. Search alphabetically, by category, or theme.",
  },
};

const gaId = process.env.NEXT_PUBLIC_GA_ID || "G-XXXXXXXXXX";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full`}>
      <head>
        {/* Google Analytics Setup */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
