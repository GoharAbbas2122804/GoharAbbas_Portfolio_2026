import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { JetBrains_Mono, Manrope, Oswald, Space_Grotesk } from "next/font/google";
import Preloader from "@/components/preloader";
import { siteUrl } from "@/lib/site";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-code" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-body" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: siteUrl, alternates: { canonical: "/" } } : {}),
  title: {
    default: "Gohar Abbas | Full-Stack Software Engineer & AI Developer",
    template: "%s | Gohar Abbas",
  },
  description:
    "Gohar Abbas is a full-stack software engineer building thoughtful web and mobile products, AI agents, and automation for clients in Pakistan and worldwide.",
  applicationName: "Gohar Abbas Portfolio",
  authors: [{ name: "Gohar Abbas", url: "https://github.com/GoharAbbas2122804" }],
  creator: "Gohar Abbas",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Gohar Abbas Portfolio",
    title: "Gohar Abbas | Full-Stack Software Engineer & AI Developer",
    description:
      "Web and mobile products, AI agents, and automation built by Gohar Abbas.",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Gohar Abbas, full-stack software engineer and AI developer" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gohar Abbas | Full-Stack Software Engineer & AI Developer",
    description:
      "Web and mobile products, AI agents, and automation built by Gohar Abbas.",
    images: ["/opengraph-image.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", jetbrainsMono.variable, spaceGrotesk.variable, manrope.variable, oswald.variable)}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{sessionStorage.removeItem("gohar:preloader-seen")}catch(e){}',
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <Preloader />
        {children}
      </body>
    </html>
  );
}
