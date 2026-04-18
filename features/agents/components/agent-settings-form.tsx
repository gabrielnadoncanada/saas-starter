"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteAgentAction,
  toggleAgentActiveAction,
  updateAgentAction,
} from "@/features/agents/actions/agent.actions";
import { type AgentToolName,ALL_AGENT_TOOL_NAMES } from "@/features/agents/types";

type AgentSummary = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  locale: string;
  modelId: string;
  welcomeMessage: string | null;
  toolsEnabled: string[];
  active: boolean;
};

export function AgentSettingsForm({ agent }: { agent: AgentSummary }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(agent.name);
  const [description, setDescription] = useState(agent.description ?? "");
  const [locale, setLocale] = useState(agent.locale);
  const [modelId, setModelId] = useState(agent.modelId);
  const [welcomeMessage, setWelcomeMessage] = useState(agent.welcomeMessage ?? "");
  const [tools, setTools] = useState<AgentToolName[]>(
    (agent.toolsEnabled as AgentToolName[]) ?? [],
  );

  function toggleTool(t: AgentToolName) {
    setTools((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function save() {
    setError(null);
    setStatus(null);
    startTransition(async () => {
      try {
        await updateAgentAction({
          agentId: agent.id,
          name,
          description: description || undefined,
          locale,
          modelId,
          welcomeMessage: welcomeMessage || undefined,
          toolsEnabled: tools,
        });
        setStatus("Saved");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save");
      }
    });
  }

  function toggleActive() {
    startTransition(async () => {
      await toggleAgentActiveAction({ agentId: agent.id, active: !agent.active });
      router.refresh();
    });
  }

  function removeAgent() {
    if (!confirm("Delete this agent and all its data? This cannot be undone.")) {
      return;
    }
    startTransition(async () => {
      try {
        await deleteAgentAction({ agentId: agent.id });
        router.push("/agents");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to delete");
      }
    });
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Slug</Label>
          <Input value={agent.slug} disabled />
        </div>
        <div>
          <Label>Locale</Label>
          <Input value={locale} onChange={(e) => setLocale(e.target.value)} />
        </div>
        <div>
          <Label>Model</Label>
          <Input value={modelId} onChange={(e) => setModelId(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label>Description</Label>
          <Textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <Label>Welcome message</Label>
          <Input
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <Label>Enabled tools</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {ALL_AGENT_TOOL_NAMES.map((t) => (
              <label
                key={t}
                className={`cursor-pointer rounded border px-2 py-1 text-xs ${
                  tools.includes(t) ? "bg-foreground text-background" : ""
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={tools.includes(t)}
                  onChange={() => toggleTool(t)}
                />
                {t}
              </label>
            ))}
          </div>
        </div>
      </div>

      {status ? <p className="text-xs text-green-700">{status}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
        <Button variant="secondary" onClick={toggleActive} disabled={pending}>
          {agent.active ? "Deactivate agent" : "Activate agent"}
        </Button>
        <Button variant="destructive" onClick={removeAgent} disabled={pending}>
          Delete agent
        </Button>
      </div>
    </div>
  );
}
