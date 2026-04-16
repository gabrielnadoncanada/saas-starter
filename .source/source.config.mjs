// source.config.ts
import {
  defineCollections,
  defineConfig,
  defineDocs
} from "fumadocs-mdx/config";
var docs = defineDocs({
  dir: "content/docs"
});
var blog = defineCollections({
  type: "doc",
  dir: "content/blog"
});
var source_config_default = defineConfig();
export {
  blog,
  source_config_default as default,
  docs
};
