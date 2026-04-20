import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";

import {
  Page,
  PageDescription,
  PageHeader,
  PageHeaderActions,
  PageTitle,
} from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentCorrectionsPanel } from "@/features/agents/components/agent-corrections-panel";
import { AgentEmbedSnippet } from "@/features/agents/components/agent-embed-snippet";
import { AgentEvalsPanel } from "@/features/agents/components/agent-evals-panel";
import { AgentInboxPanel } from "@/features/agents/components/agent-inbox-panel";
import { AgentKnowledgePanel } from "@/features/agents/components/agent-knowledge-panel";
import { AgentSettingsForm } from "@/features/agents/components/agent-settings-form";
import { AgentVersionsPanel } from "@/features/agents/components/agent-versions-panel";
import { AgentCoachPanel } from "@/features/coach/components/agent-coach-panel";
import { getAgentById } from "@/features/agents/server/agent-queries";
import {
  listAgentConversations,
  listAgentLeads,
} from "@/features/agents/server/conversation-queries";
import { listCorrections } from "@/features/agents/server/correction-mutations";
import {
  listEvalCases,
  listEvalRuns,
} from "@/features/agents/server/evals/eval-queries";
import { listKnowledgeDocuments } from "@/features/knowledge/server/document-mutations";

type PageProps = {
  params: Promise<{ agentId: string }>;
};

export default async function AgentDetailPage({ params }: PageProps) {
  const { agentId } = await params;
  const [
    agent,
    conversations,
    leads,
    documents,
    corrections,
    evalCases,
    evalRuns,
  ] = await Promise.all([
    getAgentById(agentId),
    listAgentConversations(agentId),
    listAgentLeads(agentId),
    listKnowledgeDocuments(agentId),
    listCorrections(agentId),
    listEvalCases(agentId),
    listEvalRuns(agentId),
  ]);

  if (!agent) {
    notFound();
  }

  return (
    <Page>
      <PageHeader eyebrow={`/${agent.slug}`}>
        <PageTitle>{agent.name}</PageTitle>
        <PageDescription>
          {agent.description ?? "Configure this public chat agent."}
        </PageDescription>
        {agent.organization?.slug ? (
          <PageHeaderActions>
            <Button asChild variant="outline" size="sm">
              <a
                href={`/embed/${agent.organization.slug}/${agent.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-4" />
                Preview chat
              </a>
            </Button>
          </PageHeaderActions>
        ) : null}
      </PageHeader>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="versions">
            Prompt versions ({agent.versions.length})
          </TabsTrigger>
          <TabsTrigger value="knowledge">
            Knowledge ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="inbox">
            Inbox ({conversations.length})
          </TabsTrigger>
          <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
          <TabsTrigger value="corrections">
            Corrections ({corrections.length})
          </TabsTrigger>
          <TabsTrigger value="evals">Evals ({evalCases.length})</TabsTrigger>
          <TabsTrigger value="coach">Coach</TabsTrigger>
          <TabsTrigger value="embed">Embed</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <AgentSettingsForm agent={agent} />
        </TabsContent>

        <TabsContent value="versions">
          <AgentVersionsPanel agentId={agent.id} versions={agent.versions} />
        </TabsContent>

        <TabsContent value="knowledge">
          <AgentKnowledgePanel agentId={agent.id} documents={documents} />
        </TabsContent>

        <TabsContent value="inbox">
          <AgentInboxPanel
            agentId={agent.id}
            conversations={conversations.map((c) => ({
              id: c.id,
              status: c.status,
              visitorId: c.visitorId,
              lastMessageAt: c.lastMessageAt.toISOString(),
              lead: c.lead
                ? {
                    id: c.lead.id,
                    contactEmail: c.lead.contactEmail,
                    contactName: c.lead.contactName,
                  }
                : null,
              assignedUser: c.assignedUser
                ? {
                    id: c.assignedUser.id,
                    name: c.assignedUser.name,
                    email: c.assignedUser.email,
                  }
                : null,
            }))}
          />
        </TabsContent>

        <TabsContent value="leads">
          <div className="mt-4 overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="p-2">Created</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Phone</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-b">
                    <td className="p-2">
                      {l.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                    </td>
                    <td className="p-2">{l.contactName ?? "—"}</td>
                    <td className="p-2">{l.contactEmail ?? "—"}</td>
                    <td className="p-2">{l.contactPhone ?? "—"}</td>
                    <td className="p-2">{l.status}</td>
                    <td className="p-2">{l.score ?? "—"}</td>
                  </tr>
                ))}
                {leads.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-muted-foreground p-4 text-center text-xs"
                    >
                      No leads yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="corrections">
          <AgentCorrectionsPanel
            corrections={corrections.map((c) => ({
              id: c.id,
              userMessage: c.userMessage,
              originalMessage: c.originalMessage,
              correctedMessage: c.correctedMessage,
              useAsExample: c.useAsExample,
              createdAt: c.createdAt.toISOString(),
              createdBy: c.createdBy,
            }))}
          />
        </TabsContent>

        <TabsContent value="evals">
          <AgentEvalsPanel
            agentId={agent.id}
            cases={evalCases}
            runs={evalRuns}
          />
        </TabsContent>

        <TabsContent value="coach">
          <AgentCoachPanel agentId={agent.id} />
        </TabsContent>

        <TabsContent value="embed">
          <AgentEmbedSnippet
            orgSlug={agent.organization?.slug ?? ""}
            agentSlug={agent.slug}
          />
        </TabsContent>
      </Tabs>
    </Page>
  );
}
