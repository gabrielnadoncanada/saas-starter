import { z } from "zod";
import { emailStepSchema } from "@/features/auth/schemas/email-step.schema";
import { passwordStepSchema } from "@/features/auth/schemas/password-step.schema";

export const signInStepSchema = z.object({
  email: emailStepSchema.shape.email,
  password: z.string(),
});

export const signInSchema = signInStepSchema.extend({
  password: passwordStepSchema.shape.password,
});

export type SignInValues = z.infer<typeof signInSchema>;

export const signInDefaultValues: SignInValues = {
  email: "",
  password: "",
};
