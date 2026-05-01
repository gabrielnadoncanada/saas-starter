"use server";

import { revalidatePath } from "next/cache";

import {
  disconnectAccountSchema,
  type DisconnectAccountValues,
  draftIdSchema,
  type DraftIdValues,
  updateAccountSettingsSchema,
  type UpdateAccountSettingsValues,
  updateDraftSchema,
  type UpdateDraftValues,
} from "@/features/email-agent/schemas/email-agent.schema";
import {
  rejectDraft,
  updateDraftBody,
} from "@/features/email-agent/server/drafts";
import {
  disconnectEmailAccount,
  updateAccountSettings,
} from "@/features/email-agent/server/email-accounts";
import { sendDraft } from "@/features/email-agent/server/send-reply";
import { validatedAuthenticatedAction } from "@/lib/auth/authenticated-action";
import type { FormActionState } from "@/types/form-action-state";

const EMAIL_AGENT_PATHS = [
  "/email-agent",
  "/email-agent/accounts",
  "/email-agent/settings",
] as const;

function revalidateEmailAgent() {
  for (const path of EMAIL_AGENT_PATHS) {
    revalidatePath(path);
  }
}

async function runOrError<State extends FormActionState<Record<string, unknown>>>(
  successMessage: string,
  fn: () => Promise<void>,
): Promise<State> {
  try {
    await fn();
    revalidateEmailAgent();
    return { success: successMessage } as State;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Something went wrong.",
    } as State;
  }
}

export const updateAccountSettingsAction = validatedAuthenticatedAction(
  updateAccountSettingsSchema,
  (data: UpdateAccountSettingsValues) =>
    runOrError("Settings saved", async () => {
      await updateAccountSettings({
        emailAccountId: data.emailAccountId,
        autoSendEnabled: data.autoSendEnabled,
        agentInstructions: data.agentInstructions,
        signature: data.signature,
      });
    }),
);

export const disconnectAccountAction = validatedAuthenticatedAction(
  disconnectAccountSchema,
  (data: DisconnectAccountValues) =>
    runOrError("Account disconnected", async () => {
      await disconnectEmailAccount(data.emailAccountId);
    }),
);

export const sendDraftAction = validatedAuthenticatedAction(
  draftIdSchema,
  (data: DraftIdValues) =>
    runOrError("Reply sent", async () => {
      await sendDraft(data.draftId);
    }),
);

export const rejectDraftAction = validatedAuthenticatedAction(
  draftIdSchema,
  (data: DraftIdValues) =>
    runOrError("Draft discarded", async () => {
      await rejectDraft(data.draftId);
    }),
);

export const updateDraftAction = validatedAuthenticatedAction(
  updateDraftSchema,
  (data: UpdateDraftValues) =>
    runOrError("Draft updated", async () => {
      await updateDraftBody({
        draftId: data.draftId,
        bodyText: data.bodyText,
      });
    }),
);
