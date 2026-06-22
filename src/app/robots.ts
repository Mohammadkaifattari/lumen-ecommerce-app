import type { MetadataRoute } from "next";

/** robots.txt — allow all crawlers, point them at the sitemap. */
export default function robots(): MetadataRoute.Robots {
  const origin = "https://lumen.store";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Don't index transactional/account pages.
        disallow: ["/cart", "/checkout", "/account", "/login", "/register"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
