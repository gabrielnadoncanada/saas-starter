import type { UIMessage } from "ai";

export type AssistantProvider = "google" | "groq";

export type AssistantConversationListItem = {
  id: string;
  title: string;
  preview: string | null;
  lastMessageAt: string;
};

export type AssistantConversation = AssistantConversationListItem & {
  messages: UIMessage[];
};

export type EmailMessage = {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  receivedAt: string;
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

export type ReviewInboxToolResult =
  | {
      success: true;
      result: {
        provider: string;
        messages: EmailMessage[];
        count: number;
      };
    }
  | AssistantToolFailure;

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

export type InvoiceDraftItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type CreateInvoiceDraftToolResult =
  | {
      success: true;
      result: {
        invoiceNumber: string;
        clientName: string;
        clientEmail: string | null;
        items: InvoiceDraftItem[];
        subtotal: number;
        dueDate: string;
        notes: string | null;
        currency: string;
      };
    }
  | AssistantToolFailure;
