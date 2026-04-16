import { loader } from "fumadocs-core/source";
import { toFumadocsSource } from "fumadocs-mdx/runtime/server";
import { blog } from "fumadocs-mdx:collections/server";
import type { MDXComponents } from "mdx/types";
import type { FC } from "react";

export type BlogAuthor = {
  name: string;
  avatar?: string;
};

export type BlogFrontmatter = {
  title: string;
  description?: string;
  date: string | Date;
  author: BlogAuthor;
  tags?: string[];
  body: FC<{ components?: MDXComponents }>;
};

export type BlogPage = {
  url: string;
  slugs: string[];
  data: BlogFrontmatter;
};

const rawSource = loader({
  baseUrl: "/blog",
  source: toFumadocsSource(blog as never, []),
});

export const blogSource = rawSource as unknown as Omit<
  typeof rawSource,
  "getPages" | "getPage"
> & {
  getPages(): BlogPage[];
  getPage(slugs?: string[]): BlogPage | undefined;
};
