import { z } from "zod";

export const renameOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .max(100, "Name is too long"),
});
