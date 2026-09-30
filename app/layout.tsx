import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { JetBrains_Mono } from "next/font/google";
import Preloader from "@/components/preloader";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Gohar Abbas | Portfolio 2026",
  description: "Full-Stack Web & Mobile App Developer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", "font-mono", jetbrainsMono.variable)}
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
        <Preloader />
        {children}
      </body>
    </html>
  );
}
