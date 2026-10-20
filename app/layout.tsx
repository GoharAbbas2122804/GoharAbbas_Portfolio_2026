import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { JetBrains_Mono, Manrope, Space_Grotesk } from "next/font/google";
import Preloader from "@/components/preloader";
import { siteUrl } from "@/lib/site";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-code", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-body", display: "swap" });

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
  verification: {
    google: "8uxc3lek-yNP3YSrd8jphFDj9IneXTs8veuRxI2Bh_Q",
  },
};

import VoiceCallTrigger from "@/components/ui/VoiceCallTrigger";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", jetbrainsMono.variable, spaceGrotesk.variable, manrope.variable)}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{if(sessionStorage.getItem("gohar:preloader-seen")){document.documentElement.dataset.plSeen="1";document.documentElement.dataset.plDone="true";}}catch(e){}',
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <Preloader />
        {children}
        <VoiceCallTrigger />
      </body>
    </html>
  );
}
