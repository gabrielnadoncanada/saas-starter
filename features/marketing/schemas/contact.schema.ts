import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  email: z.string().trim().email("Enter a valid email address."),
  subject: z.string().trim().min(1, "Subject is required.").max(160),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters.")
    .max(5000, "Message is too long."),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
