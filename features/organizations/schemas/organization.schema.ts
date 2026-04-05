import { z } from "zod";

const organizationNameSchema = z
  .string()
  .trim()
  .min(1, "Organization name is required")
  .max(100, "Name is too long");

export const createOrganizationSchema = z.object({
  name: organizationNameSchema,
});

export const renameOrganizationSchema = z.object({
  name: organizationNameSchema,
});
