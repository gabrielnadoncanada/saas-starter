"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  deleteCorrectionAction,
  toggleCorrectionExampleAction,
} from "@/features/agents/actions/correction.actions";

type CorrectionSummary = {
  id: string;
  userMessage: string;
  originalMessage: string;
  correctedMessage: string;
  useAsExample: boolean;
  createdAt: string;
  createdBy: { id: string; name: string | null; email: string } | null;
};

export function AgentCorrectionsPanel({
  corrections,
}: {
  corrections: CorrectionSummary[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle(id: string, next: boolean) {
    startTransition(async () => {
      await toggleCorrectionExampleAction({
        correctionId: id,
        useAsExample: next,
      });
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!confirm("Delete this correction?")) return;
    startTransition(async () => {
      await deleteCorrectionAction({ correctionId: id });
      router.refresh();
    });
  }

  if (corrections.length === 0) {
    return (
      <div className="mt-4 rounded-md border p-6 text-center">
        <p className="text-muted-foreground text-sm">
          No corrections yet. In the inbox, edit an assistant reply to create a
          training example the agent can learn from.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <p className="text-muted-foreground text-xs">
        Corrections marked{" "}
        <span className="font-medium">&ldquo;Use as example&rdquo;</span> are
        retrieved by similarity to the current user question and injected as
        few-shot examples in the system prompt.
      </p>
      <ul className="space-y-3">
        {corrections.map((c) => (
          <li key={c.id} className="rounded-md border p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-muted-foreground text-xs">
                {new Date(c.createdAt).toLocaleString()}
                {c.createdBy ? (
                  <>
                    {" "}
                    · {c.createdBy.name ?? c.createdBy.email}
                  </>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={c.useAsExample}
                    onChange={(e) => toggle(c.id, e.target.checked)}
                    disabled={pending}
                  />
                  Use as example
                </label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => remove(c.id)}
                  disabled={pending}
                >
                  Delete
                </Button>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <div className="text-muted-foreground mb-1 text-xs font-medium">
                  Visitor asked
                </div>
                <p className="bg-muted rounded p-2 text-xs whitespace-pre-wrap">
                  {c.userMessage || "—"}
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <div className="text-muted-foreground mb-1 text-xs font-medium">
                    Original answer
                  </div>
                  <p className="rounded border border-dashed p-2 text-xs whitespace-pre-wrap">
                    {c.originalMessage || "—"}
                  </p>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1 text-xs font-medium">
                    Corrected answer
                  </div>
                  <p className="rounded border border-green-600/40 bg-green-50 p-2 text-xs whitespace-pre-wrap dark:bg-green-950/20">
                    {c.correctedMessage}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
