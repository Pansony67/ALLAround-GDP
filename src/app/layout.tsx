// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MusicPlayer from "@/components/MusicPlayer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import SiteBackground from "@/components/SiteBackground";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://all-around-gdp.vercel.app";
const SITE_NAME = "ALLAround GDP";
const SITE_DESCRIPTION =
  "An interactive world GDP explorer. Click any country to see its GDP, growth rate and GDP per capita, with 35 years of World Bank data from 1990 to today.";

/* Site-wide metadata.
   metadataBase lets every relative OG/Twitter image URL below resolve to
   an absolute one, which is what Discord, LinkedIn, Slack and X need in
   order to render a link preview at all. The title template means each
   page only has to declare its own short title (see the `metadata`
   export in each page.tsx) and still ends up branded. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Explore the World Economy`,
    template: `%s - ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "GDP",
    "world economy",
    "economic data",
    "World Bank data",
    "GDP per capita",
    "country comparison",
    "data visualization",
    "interactive map",
  ],
  authors: [
    { name: "Pannadhorn Rugseree", url: "https://github.com/Pansony67" },
  ],
  creator: "Pannadhorn Rugseree",
  publisher: "Pannadhorn Rugseree",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Explore the World Economy`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Explore the World Economy`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "education",
};

export const viewport: Viewport = {
  // Stated explicitly rather than relying on the framework default: without
  // width=device-width a phone renders the page at ~980px and scales it
  // down, which makes every text size on the site unreadable.
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-black">
        {/* Fixed animated backdrop. It sits at z-index -10, so it is
            behind every page. The home page still paints bg-black on
            its own <main>, which keeps the hero video in charge there. */}
        <SiteBackground />
        <Navbar />
        {/* flex-1 keeps the footer at the bottom of short pages instead
            of floating halfway up the screen. */}
        <div className="flex-1">{children}</div>
        <Footer />
        <MusicPlayer />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
