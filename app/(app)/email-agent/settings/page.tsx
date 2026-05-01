import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/layout/page-layout";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { AccountSettingsForm } from "@/features/email-agent/components/account-settings-form";
import { ConnectAccountButton } from "@/features/email-agent/components/connect-account-button";
import { listEmailAccounts } from "@/features/email-agent/server/email-accounts";
import type { EmailAccountSummary } from "@/features/email-agent/types";

export const dynamic = "force-dynamic";

export default async function EmailAgentSettingsPage() {
  const accounts = await listEmailAccounts();

  const summaries: EmailAccountSummary[] = accounts.map((account) => ({
    id: account.id,
    email: account.email,
    provider: account.provider,
    status: account.status,
    autoSendEnabled: account.autoSendEnabled,
    lastSyncedAt: account.lastSyncedAt
      ? account.lastSyncedAt.toISOString()
      : null,
    agentInstructions: account.agentInstructions,
    signature: account.signature,
  }));

  return (
    <Page>
      <PageHeader eyebrow="Email Agent">
        <div className="space-y-1">
          <PageTitle>Agent settings</PageTitle>
          <PageDescription>
            Each mailbox has its own instructions, signature, and auto-send
            behavior.
          </PageDescription>
        </div>
      </PageHeader>

      {summaries.length === 0 ? (
        <Empty>
          <EmptyTitle>No mailboxes connected</EmptyTitle>
          <EmptyDescription>
            Connect a Gmail account first, then come back here to tune how the
            agent writes on your behalf.
          </EmptyDescription>
          <ConnectAccountButton />
        </Empty>
      ) : (
        <div className="grid gap-4">
          {summaries.map((account) => (
            <AccountSettingsForm key={account.id} account={account} />
          ))}
        </div>
      )}
    </Page>
  );
}
