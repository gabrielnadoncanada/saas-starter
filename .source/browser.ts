// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"accounts-and-auth.mdx": () => import("../content/docs/accounts-and-auth.mdx?collection=docs"), "customization.mdx": () => import("../content/docs/customization.mdx?collection=docs"), "deployment.mdx": () => import("../content/docs/deployment.mdx?collection=docs"), "development.mdx": () => import("../content/docs/development.mdx?collection=docs"), "getting-started.mdx": () => import("../content/docs/getting-started.mdx?collection=docs"), "index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "plans-and-billing.mdx": () => import("../content/docs/plans-and-billing.mdx?collection=docs"), "reference.mdx": () => import("../content/docs/reference.mdx?collection=docs"), }),
};
export default browserCollections;