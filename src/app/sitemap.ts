import type { MetadataRoute } from "next";
import { songs, categories, languages } from "@/lib/demo-data";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://christianlyrics.app";

  // 1. Core pages
  const corePages = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/songs`, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date() },
    { url: `${baseUrl}/terms`, lastModified: new Date() },
  ];

  // 2. Category pages
  const categoryPages = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
  }));

  // 3. Language pages
  const languagePages = languages.map((lang) => ({
    url: `${baseUrl}/language/${lang.slug}`,
    lastModified: new Date(),
  }));

  // 4. Song lyrics pages
  const songPages = songs.map((song) => ({
    url: `${baseUrl}/songs/${song.slug}`,
    lastModified: new Date(),
  }));

  return [...corePages, ...categoryPages, ...languagePages, ...songPages];
}
