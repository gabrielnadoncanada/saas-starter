"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  activateAgentVersionAction,
  createAgentVersionAction,
} from "@/features/agents/actions/agent.actions";

type VersionSummary = {
  id: string;
  version: number;
  systemPrompt: string;
  notes: string | null;
  active: boolean;
  createdAt: Date;
};

export function AgentVersionsPanel({
  agentId,
  versions,
}: {
  agentId: string;
  versions: VersionSummary[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const active = versions.find((v) => v.active);
  const [prompt, setPrompt] = useState(active?.systemPrompt ?? "");
  const [notes, setNotes] = useState("");
  const [activate, setActivate] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await createAgentVersionAction({
          agentId,
          systemPrompt: prompt,
          notes: notes || undefined,
          activate,
        });
        setNotes("");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save version");
      }
    });
  }

  function activateVersion(versionId: string) {
    startTransition(async () => {
      await activateAgentVersionAction({ agentId, versionId });
      router.refresh();
    });
  }

  return (
    <div className="mt-4 space-y-6">
      <section className="rounded-md border p-4">
        <h3 className="mb-3 text-sm font-semibold">Draft a new version</h3>
        <Label>System prompt</Label>
        <Textarea
          rows={10}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="mt-3">
          <Label>Notes (optional)</Label>
          <Textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What changed in this revision?"
          />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={activate}
              onChange={(e) => setActivate(e.target.checked)}
            />
            Activate immediately
          </label>
        </div>
        {error ? (
          <p className="mt-2 text-xs text-destructive">{error}</p>
        ) : null}
        <div className="mt-3">
          <Button onClick={save} disabled={pending || !prompt.trim()}>
            {pending ? "Saving…" : "Save new version"}
          </Button>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold">History</h3>
        <ul className="space-y-2">
          {versions.map((v) => (
            <li key={v.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">v{v.version}</span>
                  {v.active ? (
                    <span className="ml-2 rounded bg-green-600 px-2 py-0.5 text-xs text-white">
                      Active
                    </span>
                  ) : null}
                  <div className="text-muted-foreground text-xs">
                    {new Date(v.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setExpanded((prev) => (prev === v.id ? null : v.id))
                    }
                  >
                    {expanded === v.id ? "Hide" : "View"}
                  </Button>
                  {!v.active ? (
                    <Button
                      size="sm"
                      onClick={() => activateVersion(v.id)}
                      disabled={pending}
                    >
                      Activate
                    </Button>
                  ) : null}
                </div>
              </div>
              {expanded === v.id ? (
                <pre className="bg-muted mt-3 max-h-80 overflow-auto rounded p-3 text-xs whitespace-pre-wrap">
                  {v.systemPrompt}
                </pre>
              ) : null}
              {v.notes ? (
                <p className="text-muted-foreground mt-2 text-xs">{v.notes}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
