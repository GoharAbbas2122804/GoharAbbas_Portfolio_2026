import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Gohar Abbas to discuss a web or mobile product, AI agent, automation, or software engineering project.",
  ...(siteUrl ? { alternates: { canonical: "/contact" } } : {}),
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
