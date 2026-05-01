import Link from "next/link";

import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderActions,
  PageTitle,
} from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { ConnectAccountButton } from "@/features/email-agent/components/connect-account-button";
import { DraftsList } from "@/features/email-agent/components/drafts-list";
import { listPendingDrafts } from "@/features/email-agent/server/drafts";
import { listEmailAccounts } from "@/features/email-agent/server/email-accounts";

export const dynamic = "force-dynamic";

export default async function EmailAgentPage() {
  const [accounts, drafts] = await Promise.all([
    listEmailAccounts(),
    listPendingDrafts(),
  ]);

  const hasAccounts = accounts.length > 0;

  return (
    <Page>
      <PageHeader eyebrow="Email Agent">
        <div className="space-y-1">
          <PageTitle>Drafts to review</PageTitle>
          <PageDescription>
            New emails are scanned every few minutes. The agent drafts a reply
            and waits for your approval — or sends automatically when you turn
            auto-send on.
          </PageDescription>
        </div>
        <PageHeaderActions>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/email-agent/settings">Agent settings</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/email-agent/accounts">Mailboxes</Link>
            </Button>
          </div>
        </PageHeaderActions>
      </PageHeader>

      {!hasAccounts ? (
        <Empty>
          <EmptyTitle>Connect a mailbox to begin</EmptyTitle>
          <EmptyDescription>
            Sign in with Google to grant the agent permission to read your inbox
            and send replies on your behalf.
          </EmptyDescription>
          <ConnectAccountButton />
        </Empty>
      ) : (
        <DraftsList drafts={drafts} />
      )}
    </Page>
  );
}
