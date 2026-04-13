import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";

import { docsSource } from "@/lib/docs/source";

export default function DocsRootLayout({ children }: { children: ReactNode }) {
  return (
    <RootProvider
      theme={{
        enabled: false,
      }}
    >
      <DocsLayout tree={docsSource.pageTree} nav={{ title: "SaaS Starter" }}>
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
