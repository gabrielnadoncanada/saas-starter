"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { updateAccountSettingsAction } from "@/features/email-agent/actions/email-agent.actions";
import type { EmailAccountSummary } from "@/features/email-agent/types";
import { useToastMessage } from "@/hooks/use-toast-message";
import type { FormActionState } from "@/types/form-action-state";

export function AccountSettingsForm({
  account,
}: {
  account: EmailAccountSummary;
}) {
  const [state, action, pending] = useActionState<
    FormActionState<Record<string, unknown>>,
    FormData
  >(updateAccountSettingsAction, {});

  const [autoSendEnabled, setAutoSendEnabled] = useState(
    account.autoSendEnabled,
  );

  useToastMessage(state.success, { kind: "success", trigger: state });
  useToastMessage(state.error, { kind: "error", trigger: state });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{account.email}</CardTitle>
        <CardDescription>
          Tell the agent how to write on your behalf for this mailbox.
        </CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent className="space-y-6">
          <input type="hidden" name="emailAccountId" value={account.id} />
          <input
            type="hidden"
            name="autoSendEnabled"
            value={autoSendEnabled ? "true" : "false"}
          />

          <Field orientation="horizontal">
            <FieldLabel htmlFor={`auto-${account.id}`}>
              <div className="font-medium">Auto-send drafts</div>
              <div className="text-sm text-muted-foreground">
                When on, the agent sends replies automatically. Off keeps every
                reply as a draft for your review.
              </div>
            </FieldLabel>
            <Switch
              id={`auto-${account.id}`}
              checked={autoSendEnabled}
              onCheckedChange={setAutoSendEnabled}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor={`instructions-${account.id}`}>
              Instructions for the agent
            </FieldLabel>
            <Textarea
              id={`instructions-${account.id}`}
              name="agentInstructions"
              placeholder="e.g. I run a small consultancy. Keep replies under 4 sentences. If someone asks about pricing, say I'll follow up after I look at my schedule."
              defaultValue={account.agentInstructions ?? ""}
              rows={6}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor={`signature-${account.id}`}>Signature</FieldLabel>
            <Textarea
              id={`signature-${account.id}`}
              name="signature"
              placeholder={`Cheers,\nAlex`}
              defaultValue={account.signature ?? ""}
              rows={4}
            />
          </Field>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-3 animate-spin" /> : null}
            Save settings
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
