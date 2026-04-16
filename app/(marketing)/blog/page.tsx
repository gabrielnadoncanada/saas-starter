import type { Metadata } from "next";
import Link from "next/link";

import { Section } from "@/features/marketing/components/section";
import { SectionHeading } from "@/features/marketing/components/section-heading";
import { blogSource } from "@/lib/blog/source";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Writing from the SaaS Starter team — product updates, architecture notes, and lessons from shipping the boilerplate.",
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

function formatDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndexPage() {
  const posts = blogSource
    .getPages()
    .slice()
    .sort(
      (a, b) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
    );

  return (
    <Section>
      <SectionHeading
        eyebrow="Blog"
        title="Notes from building SaaS Starter"
        description="Short pieces on what we're shipping, how the pieces fit together, and the decisions behind the boilerplate."
      />

      <ul className="mt-16 divide-y divide-border/60 border-y border-border/60">
        {posts.map((post) => (
          <li key={post.url}>
            <Link
              href={post.url}
              className="group flex flex-col gap-3 py-8 transition-colors hover:bg-muted/40 md:flex-row md:items-baseline md:justify-between md:gap-10"
            >
              <div className="flex-1 space-y-2">
                <h2 className="text-balance text-2xl font-semibold tracking-[-0.01em] md:text-3xl">
                  {post.data.title}
                </h2>
                {post.data.description ? (
                  <p className="max-w-2xl text-balance text-sm leading-relaxed text-muted-foreground md:text-base">
                    {post.data.description}
                  </p>
                ) : null}
                <div className="flex flex-wrap items-center gap-3 pt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  <span>{post.data.author.name}</span>
                  <span aria-hidden>·</span>
                  <time dateTime={new Date(post.data.date).toISOString()}>
                    {formatDate(post.data.date)}
                  </time>
                  {post.data.tags?.length ? (
                    <>
                      <span aria-hidden>·</span>
                      <span>{post.data.tags.join(", ")}</span>
                    </>
                  ) : null}
                </div>
              </div>
              <span
                aria-hidden
                className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground transition-colors group-hover:text-foreground"
              >
                Read →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
