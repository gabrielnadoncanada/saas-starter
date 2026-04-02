"use client";

import { Loader2 } from "lucide-react";
import type { FormEventHandler, ReactNode } from "react";

import { Button } from "@/shared/components/ui/button";

type AuthPasswordStepProps = {
  email: string;
  errorMessage?: string;
  isSubmitting: boolean;
  pendingLabel: string;
  submitLabel: string;
  onChangeEmail: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
};

export function AuthPasswordStep({
  email,
  errorMessage,
  isSubmitting,
  pendingLabel,
  submitLabel,
  onChangeEmail,
  onSubmit,
  children,
}: AuthPasswordStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 rounded-lg border px-4 py-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Email</p>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto px-2 py-1 text-sm"
          onClick={onChangeEmail}
        >
          Change
        </Button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {children}
        {errorMessage ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : null}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {pendingLabel}
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </form>
    </div>
  );
}
