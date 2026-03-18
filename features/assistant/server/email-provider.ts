import "server-only";

import type { EmailMessage } from "@/features/assistant/types";

/**
 * Email provider abstraction.
 *
 * This defines a minimal interface for email inbox access.
 * Currently implements a mock provider that returns realistic sample data.
 * To connect a real provider (Gmail, Outlook), implement the EmailProvider
 * interface and swap the export below.
 *
 * The interface is intentionally small — just enough for the assistant
 * to review recent emails and suggest actions.
 */

export type EmailProvider = {
  /** Fetch recent inbox messages. */
  getRecentMessages(limit?: number): Promise<EmailMessage[]>;
  /** Provider display name (for UI). */
  name: string;
};

/**
 * Mock inbox provider.
 *
 * Returns realistic sample emails so the assistant demo works
 * without OAuth credentials. Replace with a real implementation
 * when you connect Gmail or Outlook.
 */
const mockGmailProvider: EmailProvider = {
  name: "Demo inbox",

  async getRecentMessages(limit = 5): Promise<EmailMessage[]> {
    const now = new Date();
    const messages: EmailMessage[] = [
      {
        id: "msg-1",
        from: "sarah@designstudio.co",
        subject: "Logo revisions — final round",
        snippet:
          "Hi, attached are the final logo options. Can you review and pick one by Thursday? We need to finalize before the print deadline.",
        receivedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "msg-2",
        from: "accounting@vendor.com",
        subject: "Invoice #4821 — payment overdue",
        snippet:
          "This is a reminder that invoice #4821 for $2,400.00 is 15 days overdue. Please arrange payment at your earliest convenience.",
        receivedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "msg-3",
        from: "mike@clientcorp.io",
        subject: "New project kickoff — availability next week?",
        snippet:
          "We'd like to kick off the dashboard redesign project. Are you available for a 30-min call next Tuesday or Wednesday?",
        receivedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "msg-4",
        from: "noreply@github.com",
        subject: "[saas-starter] PR #47 merged",
        snippet:
          "Pull request #47 'Add usage meters to dashboard' has been merged into main by @teammate.",
        receivedAt: new Date(
          now.getTime() - 12 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        id: "msg-5",
        from: "lisa@partnerfirm.com",
        subject: "Proposal for Q2 consulting engagement",
        snippet:
          "Please find attached our proposal for the Q2 engagement. Total: $18,500 for 3 months. Let me know if you'd like to discuss terms.",
        receivedAt: new Date(
          now.getTime() - 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ];

    return messages.slice(0, limit);
  },
};

/**
 * The active email provider.
 * Swap this export to connect a different provider.
 */
export const emailProvider: EmailProvider = mockGmailProvider;
