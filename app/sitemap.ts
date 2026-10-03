import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteUrl) return [];

  return ["/", "/contact"].map((path) => ({
    url: new URL(path, siteUrl).toString(),
    lastModified: new Date(),
    changeFrequency: path === "/" ? "monthly" : "yearly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
