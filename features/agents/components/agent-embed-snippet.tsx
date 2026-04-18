"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function AgentEmbedSnippet({
  orgSlug,
  agentSlug,
}: {
  orgSlug: string;
  agentSlug: string;
}) {
  const [copied, setCopied] = useState(false);

  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "";

  const snippet = `<script
  src="${baseUrl}/widget.js"
  data-org="${orgSlug}"
  data-agent="${agentSlug}"
  data-primary-color="#111827"
  data-label="Chat with us"
  async
></script>`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be blocked — ignore.
    }
  }

  return (
    <div className="mt-4 space-y-4">
      <section className="rounded-md border p-4">
        <h3 className="mb-2 text-sm font-semibold">Install on your site</h3>
        <p className="text-muted-foreground mb-3 text-xs">
          Paste this snippet before the closing{" "}
          <code className="bg-muted rounded px-1">&lt;/body&gt;</code> tag on
          any page where the chat widget should appear.
        </p>
        <pre className="bg-muted overflow-auto rounded p-3 text-xs">
          <code>{snippet}</code>
        </pre>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={copy}>
            {copied ? "Copied" : "Copy snippet"}
          </Button>
        </div>
      </section>

      <section className="rounded-md border p-4 text-xs">
        <h3 className="mb-2 text-sm font-semibold">Configuration</h3>
        <ul className="text-muted-foreground list-disc space-y-1 pl-4">
          <li>
            <code className="bg-muted rounded px-1">data-primary-color</code>{" "}
            sets the launcher color (any CSS color).
          </li>
          <li>
            <code className="bg-muted rounded px-1">data-label</code> sets the
            launcher label text.
          </li>
          <li>
            Add{" "}
            <code className="bg-muted rounded px-1">data-base-url</code> only
            if embedding from a domain that doesn&apos;t match the script
            origin.
          </li>
        </ul>
      </section>
    </div>
  );
}
