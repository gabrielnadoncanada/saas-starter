import type { UIMessage } from "ai";

export const assistantConversationSurface = "assistant";

export type AssistantConversationSurface =
  typeof assistantConversationSurface;

export type AssistantConversationListItem = {
  id: string;
  surface: AssistantConversationSurface;
  title: string;
  preview: string | null;
  lastMessageAt: string;
};

export type AssistantConversation = AssistantConversationListItem & {
  messages: UIMessage[];
};

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
        status: string;
      };
    }
  | AssistantToolFailure;
