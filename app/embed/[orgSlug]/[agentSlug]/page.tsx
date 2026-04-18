import { notFound } from "next/navigation";

import { PublicChat } from "@/features/agents/components/public-chat";
import {
  resolvePublicAgent,
  toAgentPublicView,
} from "@/features/agents/server/agents-registry";

type PageProps = {
  params: Promise<{ orgSlug: string; agentSlug: string }>;
};

export default async function EmbedPage({ params }: PageProps) {
  const { orgSlug, agentSlug } = await params;
  const agent = await resolvePublicAgent(orgSlug, agentSlug);
  if (!agent) {
    notFound();
  }

  return (
    <PublicChat
      orgSlug={orgSlug}
      agentSlug={agentSlug}
      agent={toAgentPublicView(agent)}
    />
  );
}
