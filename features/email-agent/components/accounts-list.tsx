"use client";

import { Loader2, Unplug } from "lucide-react";
import { useActionState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { disconnectAccountAction } from "@/features/email-agent/actions/email-agent.actions";
import type { EmailAccountSummary } from "@/features/email-agent/types";
import { useToastMessage } from "@/hooks/use-toast-message";
import type { FormActionState } from "@/types/form-action-state";

function DisconnectButton({ emailAccountId }: { emailAccountId: string }) {
  const [state, action, pending] = useActionState<
    FormActionState<Record<string, unknown>>,
    FormData
  >(disconnectAccountAction, {});

  useToastMessage(state.success, { kind: "success", trigger: state });
  useToastMessage(state.error, { kind: "error", trigger: state });

  return (
    <form action={action}>
      <input type="hidden" name="emailAccountId" value={emailAccountId} />
      <Button variant="outline" size="sm" type="submit" disabled={pending}>
        {pending ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Unplug className="size-4" />
        )}
        Disconnect
      </Button>
    </form>
  );
}

export function AccountsList({ accounts }: { accounts: EmailAccountSummary[] }) {
  if (accounts.length === 0) {
    return null;
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {accounts.map((account) => (
        <Card key={account.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>{account.email}</CardTitle>
                <CardDescription>
                  {account.provider === "GOOGLE" ? "Gmail" : account.provider}
                </CardDescription>
              </div>
              <Badge
                variant={account.status === "ACTIVE" ? "secondary" : "destructive"}
              >
                {account.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <div>
              Auto-send:{" "}
              <span className="font-medium text-foreground">
                {account.autoSendEnabled ? "On" : "Drafts only"}
              </span>
            </div>
            <div>
              Last synced:{" "}
              {account.lastSyncedAt
                ? new Date(account.lastSyncedAt).toLocaleString()
                : "Never"}
            </div>
          </CardContent>
          <CardFooter>
            {account.status !== "DISCONNECTED" ? (
              <DisconnectButton emailAccountId={account.id} />
            ) : null}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
