import { loader, update } from "fumadocs-core/source";
import { docs } from "fumadocs-mdx:collections/server";

const curatedDocPaths = new Set([
  "index.mdx",
  "getting-started.mdx",
  "customization.mdx",
  "accounts-and-auth.mdx",
  "plans-and-billing.mdx",
  "development.mdx",
  "deployment.mdx",
  "reference.mdx",
]);

const curatedDocsSource = update(docs.toFumadocsSource())
  .files((files) => files.filter((file) => curatedDocPaths.has(file.path)))
  .build();

export const docsSource = loader({
  baseUrl: "/docs",
  source: curatedDocsSource,
});
