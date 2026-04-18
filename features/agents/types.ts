import type { PublicConversationStatus } from "@prisma/client";

export type AgentToolName =
  | "createLead"
  | "requestHuman"
  | "lookupKnowledge"
  | "scheduleCallback";

export const ALL_AGENT_TOOL_NAMES: AgentToolName[] = [
  "createLead",
  "requestHuman",
  "lookupKnowledge",
  "scheduleCallback",
];

export type AgentPublicView = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  locale: string;
  welcomeMessage: string | null;
  active: boolean;
};

export type PublicConversationMessagesContext = {
  pageUrl?: string;
  referrer?: string;
  locale?: string;
  [k: string]: unknown;
};

export type AssistantToolFailure = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export type CreateLeadToolResult =
  | {
      success: true;
      leadId: string;
      summary: string;
    }
  | AssistantToolFailure;

export type RequestHumanToolResult =
  | {
      success: true;
      message: string;
    }
  | AssistantToolFailure;

export type LookupKnowledgeToolResult =
  | {
      success: true;
      results: Array<{
        content: string;
        title: string;
        score: number;
      }>;
    }
  | AssistantToolFailure;

export type ScheduleCallbackToolResult =
  | {
      success: true;
      leadId: string;
    }
  | AssistantToolFailure;

export type PublicConversationStatusType = PublicConversationStatus;
