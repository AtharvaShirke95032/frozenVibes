import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { stories } from "@/data/stories";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "stories/", "films/", "about/", "contact/", ...stories.map((s) => `stories/${s.slug}/`)];
  return pages.map((p) => ({ url: `${site.url}/${p}` }));
}
