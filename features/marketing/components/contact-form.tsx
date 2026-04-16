"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { FormAlert } from "@/components/ui/form-alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  sendContactMessageAction,
  type ContactActionState,
} from "@/features/marketing/actions/contact.actions";
import { getFieldState } from "@/lib/get-field-state";

export function ContactForm() {
  const [state, formAction, isPending] = useActionState<
    ContactActionState,
    FormData
  >(sendContactMessageAction, {});

  const nameField = getFieldState(state, "name");
  const emailField = getFieldState(state, "email");
  const subjectField = getFieldState(state, "subject");
  const messageField = getFieldState(state, "message");

  if (state.success) {
    return <FormAlert tone="success">{state.success}</FormAlert>;
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={nameField.invalid}>
          <FieldLabel htmlFor="contact-name">Name</FieldLabel>
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            defaultValue={nameField.value}
            aria-invalid={nameField.invalid}
            required
          />
          <FieldError>{nameField.error}</FieldError>
        </Field>

        <Field data-invalid={emailField.invalid}>
          <FieldLabel htmlFor="contact-email">Email</FieldLabel>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={emailField.value}
            aria-invalid={emailField.invalid}
            required
          />
          <FieldError>{emailField.error}</FieldError>
        </Field>
      </div>

      <Field data-invalid={subjectField.invalid}>
        <FieldLabel htmlFor="contact-subject">Subject</FieldLabel>
        <Input
          id="contact-subject"
          name="subject"
          defaultValue={subjectField.value}
          aria-invalid={subjectField.invalid}
          required
        />
        <FieldError>{subjectField.error}</FieldError>
      </Field>

      <Field data-invalid={messageField.invalid}>
        <FieldLabel htmlFor="contact-message">Message</FieldLabel>
        <Textarea
          id="contact-message"
          name="message"
          rows={6}
          defaultValue={messageField.value}
          aria-invalid={messageField.invalid}
          required
        />
        <FieldError>{messageField.error}</FieldError>
      </Field>

      {state.error ? <FormAlert>{state.error}</FormAlert> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
