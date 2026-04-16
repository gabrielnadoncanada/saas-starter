import type { MetadataRoute } from "next";

import { routes } from "@/constants/routes";
import { blogSource } from "@/lib/blog/source";
import { docsSource } from "@/lib/docs/source";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.BASE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  const lastModified = new Date();

  const marketingEntries: MetadataRoute.Sitemap = [
    { url: `${base}${routes.marketing.home}`, lastModified, changeFrequency: "weekly" as const, priority: 1 },
    { url: `${base}${routes.marketing.pricing}`, lastModified, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${base}${routes.marketing.blog}`, lastModified, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${base}${routes.marketing.license}`, lastModified, changeFrequency: "yearly" as const, priority: 0.5 },
    { url: `${base}${routes.marketing.privacy}`, lastModified, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${base}${routes.marketing.terms}`, lastModified, changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  const docEntries: MetadataRoute.Sitemap = docsSource.getPages().map((page) => ({
    url: `${base}${page.url}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogSource.getPages().map((page) => ({
    url: `${base}${page.url}`,
    lastModified: new Date(page.data.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...marketingEntries, ...docEntries, ...blogEntries];
}
