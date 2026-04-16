"use server";

import {
  contactFormSchema,
  type ContactFormValues,
} from "@/features/marketing/schemas/contact.schema";
import { validatedPublicAction } from "@/lib/auth/authenticated-action";
import { sendContactMessageEmail } from "@/lib/email/senders";
import { enforceActionRateLimit } from "@/lib/rate-limit";
import type { FormActionState } from "@/types/form-action-state";

export type ContactActionState = FormActionState<ContactFormValues>;

function resolveContactRecipient(): string | null {
  const explicit = process.env.CONTACT_FORM_TO?.trim();
  if (explicit) return explicit;

  const from = process.env.EMAIL_FROM?.trim();
  if (!from) return null;

  const match = from.match(/<([^>]+)>/);
  return match?.[1] ?? from;
}

export const sendContactMessageAction = validatedPublicAction(
  contactFormSchema,
  async (data): Promise<ContactActionState> => {
    const rateLimited = await enforceActionRateLimit("public");
    if (rateLimited) {
      return { error: rateLimited.error, values: data };
    }

    const recipient = resolveContactRecipient();
    if (!recipient) {
      return {
        error: "Contact form is not configured. Please try again later.",
        values: data,
      };
    }

    try {
      await sendContactMessageEmail({
        to: recipient,
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      });
    } catch {
      return {
        error: "We couldn't send your message. Please try again later.",
        values: data,
      };
    }

    return { success: "Thanks! We'll get back to you shortly." };
  },
);
