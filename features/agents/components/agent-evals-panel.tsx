"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createEvalCaseAction,
  deleteEvalCaseAction,
  runEvalAction,
  updateEvalCaseAction,
} from "@/features/agents/actions/eval.actions";

type EvalCaseSummary = {
  id: string;
  name: string;
  input: string;
  expectedOutput: string | null;
  criteria: string | null;
  tags: string[];
  enabled: boolean;
  createdAt: Date;
};

type EvalRunSummary = {
  id: string;
  status: string;
  totalCases: number;
  passedCases: number;
  averageScore: number | null;
  errorMessage: string | null;
  startedAt: Date;
  completedAt: Date | null;
  agentVersion: { id: string; version: number } | null;
};

export function AgentEvalsPanel({
  agentId,
  cases,
  runs,
}: {
  agentId: string;
  cases: EvalCaseSummary[];
  runs: EvalRunSummary[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [input, setInput] = useState("");
  const [expected, setExpected] = useState("");
  const [criteria, setCriteria] = useState("");

  function create() {
    if (!name.trim() || !input.trim()) {
      setError("Name and input are required");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await createEvalCaseAction({
          agentId,
          name: name.trim(),
          input: input.trim(),
          expectedOutput: expected.trim() || undefined,
          criteria: criteria.trim() || undefined,
          tags: [],
        });
        setName("");
        setInput("");
        setExpected("");
        setCriteria("");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to create case");
      }
    });
  }

  function toggleEnabled(caseId: string, enabled: boolean) {
    startTransition(async () => {
      await updateEvalCaseAction({ caseId, enabled });
      router.refresh();
    });
  }

  function remove(caseId: string) {
    if (!confirm("Delete this eval case?")) return;
    startTransition(async () => {
      await deleteEvalCaseAction({ caseId });
      router.refresh();
    });
  }

  function run() {
    setError(null);
    setStatus("Running evals — this may take a minute…");
    startTransition(async () => {
      try {
        const result = await runEvalAction({ agentId });
        setStatus(
          `Done: ${result.passed}/${result.totalCases} passed · avg ${Math.round(
            (result.averageScore ?? 0) * 100,
          )}%`,
        );
        router.refresh();
      } catch (e) {
        setStatus(null);
        setError(e instanceof Error ? e.message : "Run failed");
      }
    });
  }

  const enabledCount = cases.filter((c) => c.enabled).length;

  return (
    <div className="mt-4 space-y-6">
      <section className="rounded-md border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Run evaluation</h3>
            <p className="text-muted-foreground text-xs">
              Runs the active prompt version against {enabledCount} enabled
              case
              {enabledCount === 1 ? "" : "s"}. Uses an LLM judge to score each
              answer; updates the active version&apos;s score.
            </p>
          </div>
          <Button onClick={run} disabled={pending || enabledCount === 0}>
            {pending ? "Running…" : "Run evaluation"}
          </Button>
        </div>
        {status ? (
          <p className="text-muted-foreground mt-2 text-xs">{status}</p>
        ) : null}
        {error ? (
          <p className="text-destructive mt-2 text-xs">{error}</p>
        ) : null}
      </section>

      <section className="rounded-md border p-4">
        <h3 className="mb-3 text-sm font-semibold">Add an eval case</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Asks for thickness options"
            />
          </div>
          <div className="md:col-span-2">
            <Label>User input</Label>
            <Textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What thicknesses of contreplaqué do you offer?"
            />
          </div>
          <div>
            <Label>Expected output (optional)</Label>
            <Textarea
              rows={3}
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              placeholder="Reference answer the judge should compare against"
            />
          </div>
          <div>
            <Label>Criteria (optional)</Label>
            <Textarea
              rows={3}
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              placeholder="Must mention 4mm through 25mm; must not invent pricing"
            />
          </div>
        </div>
        <div className="mt-3">
          <Button
            onClick={create}
            disabled={pending || !name.trim() || !input.trim()}
          >
            {pending ? "Saving…" : "Add case"}
          </Button>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold">Cases ({cases.length})</h3>
        {cases.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No eval cases yet. Add a few representative questions with expected
            answers or criteria so you can measure prompt changes objectively.
          </p>
        ) : (
          <ul className="space-y-2">
            {cases.map((c) => (
              <li key={c.id} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{c.name}</span>
                      {!c.enabled ? (
                        <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs">
                          disabled
                        </span>
                      ) : null}
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs whitespace-pre-wrap">
                      {c.input}
                    </p>
                    {c.expectedOutput ? (
                      <p className="mt-2 border-l-2 border-green-600/40 pl-2 text-xs whitespace-pre-wrap">
                        <span className="text-muted-foreground font-medium">
                          Expected:{" "}
                        </span>
                        {c.expectedOutput}
                      </p>
                    ) : null}
                    {c.criteria ? (
                      <p className="mt-1 border-l-2 border-blue-600/40 pl-2 text-xs whitespace-pre-wrap">
                        <span className="text-muted-foreground font-medium">
                          Criteria:{" "}
                        </span>
                        {c.criteria}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={c.enabled}
                        onChange={(e) => toggleEnabled(c.id, e.target.checked)}
                        disabled={pending}
                      />
                      Enabled
                    </label>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => remove(c.id)}
                      disabled={pending}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold">Recent runs</h3>
        {runs.length === 0 ? (
          <p className="text-muted-foreground text-sm">No runs yet.</p>
        ) : (
          <ul className="space-y-2">
            {runs.map((r) => {
              const pct =
                r.averageScore != null
                  ? Math.round(r.averageScore * 100)
                  : null;
              return (
                <li key={r.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium">
                        {r.agentVersion
                          ? `v${r.agentVersion.version}`
                          : "unknown"}{" "}
                        · {r.passedCases}/{r.totalCases} passed
                        {pct != null ? ` · avg ${pct}%` : ""}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {new Date(r.startedAt).toLocaleString()} · {r.status}
                      </div>
                      {r.errorMessage ? (
                        <div className="text-destructive mt-1 text-xs">
                          {r.errorMessage}
                        </div>
                      ) : null}
                    </div>
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        r.status === "COMPLETED"
                          ? "bg-green-600 text-white"
                          : r.status === "FAILED"
                            ? "bg-destructive text-destructive-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
