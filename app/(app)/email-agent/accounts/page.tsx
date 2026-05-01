import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderActions,
  PageTitle,
} from "@/components/layout/page-layout";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { AccountsList } from "@/features/email-agent/components/accounts-list";
import { ConnectAccountButton } from "@/features/email-agent/components/connect-account-button";
import { listEmailAccounts } from "@/features/email-agent/server/email-accounts";
import type { EmailAccountSummary } from "@/features/email-agent/types";

export const dynamic = "force-dynamic";

type SearchParams = { connected?: string; error?: string };

export default async function EmailAgentAccountsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
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
          <PageTitle>Connected mailboxes</PageTitle>
          <PageDescription>
            Connect a Gmail account to let the agent monitor it. Disconnecting
            stops the sync — your drafts and history are kept.
          </PageDescription>
        </div>
        <PageHeaderActions>
          <ConnectAccountButton label="Connect another mailbox" />
        </PageHeaderActions>
      </PageHeader>

      {params.connected ? (
        <p className="rounded border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm text-emerald-700 dark:text-emerald-300">
          Connected {params.connected}.
        </p>
      ) : null}
      {params.error ? (
        <p className="rounded border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {params.error}
        </p>
      ) : null}

      {summaries.length === 0 ? (
        <Empty>
          <EmptyTitle>No mailboxes yet</EmptyTitle>
          <EmptyDescription>
            Connect Gmail with the button above. The agent only reads recent
            inbox messages and sends replies you approve (or auto-send when you
            opt in).
          </EmptyDescription>
        </Empty>
      ) : (
        <AccountsList accounts={summaries} />
      )}
    </Page>
  );
}
