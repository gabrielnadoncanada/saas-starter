import Link from "next/link";

import {
  Page,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/layout/page-layout";
import { AgentCreateCard } from "@/features/agents/components/agent-create-card";
import { listAgents } from "@/features/agents/server/agent-queries";

export const metadata = { title: "Agents" };

export default async function AgentsIndexPage() {
  const agents = await listAgents();

  return (
    <Page>
      <PageHeader eyebrow="Public chat">
        <PageTitle>Agents</PageTitle>
        <PageDescription>
          Configure assistants that handle conversations on your customer-facing
          sites via the embedded widget. Each agent has its own prompt versions,
          knowledge base, and inbox.
        </PageDescription>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Link
            key={agent.id}
            href={`/agents/${agent.id}`}
            className="rounded-lg border p-4 transition hover:bg-muted"
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold">{agent.name}</div>
              <span className="text-muted-foreground text-xs">
                {agent.active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="text-muted-foreground text-xs">/{agent.slug}</div>
            {agent.description ? (
              <p className="mt-2 line-clamp-2 text-sm">{agent.description}</p>
            ) : null}
            <div className="text-muted-foreground mt-4 flex gap-4 text-xs">
              <span>{agent._count.publicConversations} conversations</span>
              <span>{agent._count.versions} versions</span>
              <span>{agent._count.knowledgeDocuments} documents</span>
            </div>
          </Link>
        ))}
      </div>

      <AgentCreateCard />
    </Page>
  );
}
