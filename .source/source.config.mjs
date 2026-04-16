// source.config.ts
import {
  defineCollections,
  defineConfig,
  defineDocs,
  frontmatterSchema
} from "fumadocs-mdx/config";
import { z } from "zod";
var docs = defineDocs({
  dir: "content/docs"
});
var blog = defineCollections({
  type: "doc",
  dir: "content/blog",
  schema: frontmatterSchema.extend({
    date: z.string().or(z.date()),
    author: z.object({
      name: z.string(),
      avatar: z.string().optional()
    }),
    tags: z.array(z.string()).optional()
  })
});
var source_config_default = defineConfig();
export {
  blog,
  source_config_default as default,
  docs
};
