"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAgentAction } from "@/features/agents/actions/agent.actions";
import { type AgentToolName,ALL_AGENT_TOOL_NAMES } from "@/features/agents/types";

const DEFAULT_PROMPT = `You are a helpful, professional assistant for our website visitors.
Ask qualifying questions, answer factually using lookupKnowledge, and capture leads via createLead when the visitor shares contact info.`;

export function AgentCreateCard() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [locale, setLocale] = useState("en");
  const [modelId, setModelId] = useState("gemini-2.5-flash");
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Hi! How can I help you today?",
  );
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_PROMPT);
  const [tools, setTools] = useState<AgentToolName[]>([...ALL_AGENT_TOOL_NAMES]);

  function toggleTool(t: AgentToolName) {
    setTools((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await createAgentAction({
          slug,
          name,
          description: description || undefined,
          locale,
          modelId,
          systemPrompt,
          welcomeMessage: welcomeMessage || undefined,
          toolsEnabled: tools,
        });
        router.push(`/agents/${result.id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to create agent");
      }
    });
  }

  if (!open) {
    return (
      <div className="mt-6">
        <Button onClick={() => setOpen(true)}>Create new agent</Button>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-lg border p-4">
      <h3 className="mb-4 text-lg font-semibold">New agent</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Slug</Label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="sales-bot"
          />
        </div>
        <div>
          <Label>Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sales Assistant"
          />
        </div>
        <div>
          <Label>Locale</Label>
          <Input
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            placeholder="en"
          />
        </div>
        <div>
          <Label>Model</Label>
          <Input value={modelId} onChange={(e) => setModelId(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label>Description</Label>
          <Input
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
          <Label>System prompt</Label>
          <Textarea
            rows={6}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
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
      {error ? (
        <p className="mt-3 text-sm text-destructive">{error}</p>
      ) : null}
      <div className="mt-4 flex gap-2">
        <Button onClick={submit} disabled={pending || !slug || !name}>
          {pending ? "Creating…" : "Create agent"}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
