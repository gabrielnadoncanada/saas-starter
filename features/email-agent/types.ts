import type {
  AgentDraft,
  AgentDraftStatus,
  EmailAccount,
  EmailAccountStatus,
  EmailMessage,
  EmailMessageDirection,
  EmailProvider,
  EmailThread,
} from "@prisma/client";

export type {
  AgentDraft,
  AgentDraftStatus,
  EmailAccount,
  EmailAccountStatus,
  EmailMessage,
  EmailMessageDirection,
  EmailProvider,
  EmailThread,
};

export type EmailAccountSummary = {
  id: string;
  email: string;
  provider: EmailProvider;
  status: EmailAccountStatus;
  autoSendEnabled: boolean;
  lastSyncedAt: string | null;
  agentInstructions: string | null;
  signature: string | null;
};

export type AgentDraftWithContext = AgentDraft & {
  thread: EmailThread & { messages: EmailMessage[] };
  emailAccount: EmailAccount;
};

export type DraftListItem = {
  id: string;
  status: AgentDraftStatus;
  subject: string;
  bodyText: string;
  createdAt: string;
  threadId: string;
  threadSubject: string;
  participants: string;
  accountEmail: string;
  lastIncomingSnippet: string | null;
};
