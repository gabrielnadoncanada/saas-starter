"use client";

import { Loader2, Send, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  rejectDraftAction,
  sendDraftAction,
  updateDraftAction,
} from "@/features/email-agent/actions/email-agent.actions";
import { useToastMessage } from "@/hooks/use-toast-message";
import type { FormActionState } from "@/types/form-action-state";

type DraftCardProps = {
  draft: {
    id: string;
    subject: string;
    bodyText: string;
    status: string;
    createdAt: string;
    accountEmail: string;
    threadSubject: string;
    participants: string;
    errorMessage: string | null;
  };
};

export function DraftCard({ draft }: DraftCardProps) {
  const [bodyText, setBodyText] = useState(draft.bodyText);

  const [updateState, updateAction, updatePending] = useActionState<
    FormActionState<Record<string, unknown>>,
    FormData
  >(updateDraftAction, {});
  const [sendState, sendAction, sendPending] = useActionState<
    FormActionState<Record<string, unknown>>,
    FormData
  >(sendDraftAction, {});
  const [rejectState, rejectAction, rejectPending] = useActionState<
    FormActionState<Record<string, unknown>>,
    FormData
  >(rejectDraftAction, {});

  useToastMessage(updateState.success, { kind: "success", trigger: updateState });
  useToastMessage(updateState.error, { kind: "error", trigger: updateState });
  useToastMessage(sendState.success, { kind: "success", trigger: sendState });
  useToastMessage(sendState.error, { kind: "error", trigger: sendState });
  useToastMessage(rejectState.success, { kind: "success", trigger: rejectState });
  useToastMessage(rejectState.error, { kind: "error", trigger: rejectState });

  const isPending = updatePending || sendPending || rejectPending;
  const isFailed = draft.status === "FAILED";

  return (
    <Card data-status={draft.status}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">
              {draft.accountEmail}
            </div>
            <div className="font-semibold">{draft.threadSubject}</div>
            <div className="text-xs text-muted-foreground">
              {draft.participants}
            </div>
          </div>
          <Badge variant={isFailed ? "destructive" : "secondary"}>
            {draft.status}
          </Badge>
        </div>
        {draft.errorMessage ? (
          <p className="text-xs text-destructive">{draft.errorMessage}</p>
        ) : null}
      </CardHeader>

      <CardContent>
        <form
          action={updateAction}
          className="flex flex-col gap-3"
          id={`update-form-${draft.id}`}
        >
          <input type="hidden" name="draftId" value={draft.id} />
          <Textarea
            name="bodyText"
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            rows={8}
            className="font-mono text-sm"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={isPending || bodyText === draft.bodyText}
            >
              {updatePending ? <Loader2 className="size-3 animate-spin" /> : null}
              Save edits
            </Button>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex justify-between gap-2">
        <form action={rejectAction}>
          <input type="hidden" name="draftId" value={draft.id} />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            disabled={isPending}
          >
            {rejectPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Discard
          </Button>
        </form>
        <form action={sendAction}>
          <input type="hidden" name="draftId" value={draft.id} />
          <Button type="submit" disabled={isPending}>
            {sendPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Send reply
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
