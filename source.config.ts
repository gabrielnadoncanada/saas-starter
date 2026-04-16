import {
  defineCollections,
  defineConfig,
  defineDocs,
  frontmatterSchema,
} from "fumadocs-mdx/config";
import { z } from "zod";

export const docs = defineDocs({
  dir: "content/docs",
});

export const blog = defineCollections({
  type: "doc",
  dir: "content/blog",
  schema: frontmatterSchema.extend({
    date: z.string().or(z.date()),
    author: z.object({
      name: z.string(),
      avatar: z.string().optional(),
    }),
    tags: z.array(z.string()).optional(),
  }),
});

export default defineConfig();
