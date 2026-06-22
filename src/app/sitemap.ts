import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/data";

/**
 * Dynamic sitemap. Covers the static pages plus one URL per product slug.
 * Update the production origin before deploying.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = "https://lumen.store";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${origin}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/shop`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${origin}/cart`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${origin}/checkout`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${origin}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${origin}/register`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${origin}/account`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  const productRoutes: MetadataRoute.Sitemap = getAllProducts().map((p) => ({
    url: `${origin}/product/${p.slug}`,
    lastModified: new Date(p.createdAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
