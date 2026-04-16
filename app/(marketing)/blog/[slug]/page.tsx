import defaultMdxComponents from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { routes } from "@/constants/routes";
import { blogSource } from "@/lib/blog/source";

function formatDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateStaticParams() {
  return blogSource.getPages().map((page) => ({
    slug: page.slugs[0] ?? "",
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = blogSource.getPage([params.slug]);

  if (!page) return {};

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      type: "article",
      publishedTime: new Date(page.data.date).toISOString(),
      authors: [page.data.author.name],
    },
  };
}

export default async function BlogPostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const page = blogSource.getPage([params.slug]);

  if (!page) {
    notFound();
  }

  const MDXContent = page.data.body;

  return (
    <article className="container mx-auto max-w-3xl px-6 py-20 md:px-10 md:py-28">
      <div className="mb-10">
        <Link
          href={routes.marketing.blog}
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to blog
        </Link>
      </div>

      <header className="mb-12 space-y-6 border-b border-border/60 pb-10">
        {page.data.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {page.data.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.02em] md:text-5xl lg:text-6xl">
          {page.data.title}
        </h1>

        {page.data.description ? (
          <p className="text-balance text-lg leading-relaxed text-muted-foreground md:text-xl">
            {page.data.description}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span>{page.data.author.name}</span>
          <span aria-hidden>·</span>
          <time dateTime={new Date(page.data.date).toISOString()}>
            {formatDate(page.data.date)}
          </time>
        </div>
      </header>

      <div className="prose prose-neutral max-w-none dark:prose-invert">
        <MDXContent components={defaultMdxComponents} />
      </div>
    </article>
  );
}
