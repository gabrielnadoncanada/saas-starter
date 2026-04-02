import type { UIMessage } from "ai";

import type { AiModelId } from "@/shared/lib/ai/models";

export type AiConversationSurface = "assistant";

export type OrganizationAiSettingsView = {
  organizationId: string;
  defaultModelId: AiModelId;
  allowedModelIds: AiModelId[];
};

export type AiConversationListItem = {
  id: string;
  surface: AiConversationSurface;
  title: string;
  preview: string | null;
  lastMessageAt: string;
};

export type AiConversation = AiConversationListItem & {
  messages: UIMessage[];
};
