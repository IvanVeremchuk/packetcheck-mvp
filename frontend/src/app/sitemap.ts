import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/guides";

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? "https://packetcheck.net").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/pricing", "/docs", "/guides", "/legal"].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.6,
  }));
  const guides = GUIDES.map((g) => ({
    url: `${BASE}/guides/${g.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  return [...pages, ...guides];
}
