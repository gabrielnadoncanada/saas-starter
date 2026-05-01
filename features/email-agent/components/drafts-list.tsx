import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { DraftCard } from "@/features/email-agent/components/draft-card";

type Draft = {
  id: string;
  subject: string;
  bodyText: string;
  status: string;
  createdAt: Date;
  errorMessage: string | null;
  thread: { id: string; subject: string; participants: string };
  emailAccount: { email: string };
};

export function DraftsList({ drafts }: { drafts: Draft[] }) {
  if (drafts.length === 0) {
    return (
      <Empty>
        <EmptyTitle>No drafts waiting</EmptyTitle>
        <EmptyDescription>
          When new emails arrive, the agent will draft replies here for your
          review.
        </EmptyDescription>
      </Empty>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {drafts.map((draft) => (
        <DraftCard
          key={draft.id}
          draft={{
            id: draft.id,
            subject: draft.subject,
            bodyText: draft.bodyText,
            status: draft.status,
            createdAt: draft.createdAt.toISOString(),
            accountEmail: draft.emailAccount.email,
            threadSubject: draft.thread.subject,
            participants: draft.thread.participants,
            errorMessage: draft.errorMessage,
          }}
        />
      ))}
    </div>
  );
}
