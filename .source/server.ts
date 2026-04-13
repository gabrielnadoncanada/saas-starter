// @ts-nocheck
import * as __fd_glob_7 from "../content/docs/reference.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/plans-and-billing.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/index.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/getting-started.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/development.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/deployment.mdx?collection=docs"
import * as __fd_glob_1 from "../content/docs/customization.mdx?collection=docs"
import * as __fd_glob_0 from "../content/docs/accounts-and-auth.mdx?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {}, {"accounts-and-auth.mdx": __fd_glob_0, "customization.mdx": __fd_glob_1, "deployment.mdx": __fd_glob_2, "development.mdx": __fd_glob_3, "getting-started.mdx": __fd_glob_4, "index.mdx": __fd_glob_5, "plans-and-billing.mdx": __fd_glob_6, "reference.mdx": __fd_glob_7, });