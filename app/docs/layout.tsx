import "@/app/docs.css";

import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider/next";
import { ArrowLeftIcon, Github } from "lucide-react";
import type { ReactNode } from "react";

import { DocsBrandTitle } from "@/features/docs/components/docs-brand-title";
import { docsSource } from "@/lib/docs/source";

export default function DocsRootLayout({ children }: { children: ReactNode }) {
  return (
    <RootProvider
      theme={{
        enabled: false,
      }}
    >
      <DocsLayout
        tree={docsSource.pageTree}
        nav={{
          title: <DocsBrandTitle />,
          url: "/",
          transparentMode: "top",
        }}
        links={[
          {
            type: "main",
            text: "Back to site",
            url: "/",
            icon: <ArrowLeftIcon className="size-4" strokeWidth={1.75} />,
          },
          {
            type: "icon",
            label: "GitHub",
            icon: <Github className="size-4" strokeWidth={1.75} />,
            text: "GitHub",
            url: "https://github.com",
            external: true,
          },
        ]}
      >
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
