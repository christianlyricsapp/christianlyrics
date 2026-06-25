import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://christianlyrics.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin/songs/*/edit",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
