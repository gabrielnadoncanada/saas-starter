import type { TaskStatus } from "@/shared/lib/db/enums";

/** DB filter for ai conversations; single surface in this app. */
export const assistantConversationSurface = "assistant";

export type AssistantToolErrorCode =
  | "UPGRADE_REQUIRED"
  | "LIMIT_REACHED"
  | "UNKNOWN";

export type AssistantToolFailure = {
  success: false;
  error: {
    code: AssistantToolErrorCode;
    message: string;
  };
};

export type CreateTaskToolResult =
  | {
      success: true;
      result: {
        taskCode: string;
        title: string;
        status: TaskStatus;
      };
    }
  | AssistantToolFailure;
