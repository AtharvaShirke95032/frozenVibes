import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import Cursor from "@/components/Cursor";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import Preloader from "@/components/Preloader";
import SmoothScroll from "@/components/SmoothScroll";
import { TransitionProvider } from "@/components/PageTransition";
import { site } from "@/data/site";
import "./globals.css";

const serif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.legalName} — Wedding Photography & Films, Mumbai`,
    template: `%s — ${site.legalName}`,
  },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.legalName,
    locale: "en_IN",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: site.legalName }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#111111",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="grain min-h-svh">
        <SmoothScroll>
          <TransitionProvider>
            <Preloader />
            <Nav />
            <main>{children}</main>
            <Footer />
            <Cursor />
          </TransitionProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
