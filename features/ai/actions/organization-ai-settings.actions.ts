"use server";

import { validatedOrganizationOwnerAction } from "@/features/organizations/actions/validated-organization-owner.action";

import { organizationAiSettingsSchema } from "../schemas/organization-ai-settings.schema";
import { updateOrganizationAiSettings } from "../server/organization-ai-settings";

export const updateOrganizationAiSettingsAction =
  validatedOrganizationOwnerAction<
    typeof organizationAiSettingsSchema,
    { refreshKey?: number }
  >(organizationAiSettingsSchema, async (data, _, { organizationId }) => {
    try {
      await updateOrganizationAiSettings(organizationId, data);
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update AI settings",
      };
    }

    return {
      success: "AI settings updated successfully",
      refreshKey: Date.now(),
    };
  });
