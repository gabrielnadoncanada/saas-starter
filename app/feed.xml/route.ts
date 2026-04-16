import { blogSource } from "@/lib/blog/source";

const FEED_TITLE = "SaaS Starter Blog";
const FEED_DESCRIPTION =
  "Writing from the SaaS Starter team — product updates, architecture notes, and lessons from shipping the boilerplate.";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const base = (process.env.BASE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );

  const posts = blogSource
    .getPages()
    .slice()
    .sort(
      (a, b) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
    );

  const latest = posts[0]?.data.date
    ? new Date(posts[0].data.date).toUTCString()
    : new Date().toUTCString();

  const items = posts
    .map((post) => {
      const url = `${base}${post.url}`;
      const pubDate = new Date(post.data.date).toUTCString();
      const description = post.data.description ?? "";
      return `    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(post.data.author.name)}</author>
      <description>${escapeXml(description)}</description>
    </item>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${escapeXml(`${base}/blog`)}</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${latest}</lastBuildDate>
    <atom:link href="${escapeXml(`${base}/feed.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
