import type { AssistantToolFailure } from "@/features/assistant/types";
import { LimitReachedError } from "@/features/billing/errors/limit-reached";
import { UpgradeRequiredError } from "@/features/billing/errors/upgrade-required";

export function toAssistantToolFailure(error: unknown): AssistantToolFailure {
  if (error instanceof UpgradeRequiredError) {
    return {
      success: false,
      error: {
        code: "UPGRADE_REQUIRED",
        message: error.message,
      },
    };
  }

  if (error instanceof LimitReachedError) {
    return {
      success: false,
      error: {
        code: "LIMIT_REACHED",
        message: error.message,
      },
    };
  }

  return {
    success: false,
    error: {
      code: "UNKNOWN",
      message: error instanceof Error ? error.message : "Something went wrong",
    },
  };
}
