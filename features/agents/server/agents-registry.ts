import "server-only";

import { cache } from "react";

import type { AgentPublicView, AgentToolName } from "@/features/agents/types";
import { db } from "@/lib/db/prisma";
import { runAsAdmin } from "@/lib/db/tenant-scope";

export type ResolvedAgent = {
  id: string;
  organizationId: string;
  slug: string;
  name: string;
  description: string | null;
  locale: string;
  modelId: string;
  toolsEnabled: AgentToolName[];
  qualificationSchema: unknown;
  welcomeMessage: string | null;
  active: boolean;
  activeVersion: {
    id: string;
    version: number;
    systemPrompt: string;
  } | null;
};

/**
 * Resolve an agent by organization slug + agent slug. Used at the public chat
 * endpoint where no user session is available; bypasses tenant scoping via
 * runAsAdmin because resolution happens before tenant context is known.
 */
export const resolvePublicAgent = cache(
  async (
    organizationSlug: string,
    agentSlug: string,
  ): Promise<ResolvedAgent | null> => {
    return runAsAdmin(async () => {
      const organization = await db.organization.findUnique({
        where: { slug: organizationSlug },
        select: { id: true },
      });

      if (!organization) return null;

      const agent = await db.agent.findUnique({
        where: {
          organizationId_slug: {
            organizationId: organization.id,
            slug: agentSlug,
          },
        },
        include: {
          versions: {
            where: { active: true },
            orderBy: { version: "desc" },
            take: 1,
          },
        },
      });

      if (!agent || !agent.active) return null;

      const activeVersion = agent.versions[0] ?? null;

      return {
        id: agent.id,
        organizationId: agent.organizationId,
        slug: agent.slug,
        name: agent.name,
        description: agent.description,
        locale: agent.locale,
        modelId: agent.modelId,
        toolsEnabled: (agent.toolsEnabled as AgentToolName[]) ?? [],
        qualificationSchema: agent.qualificationSchema,
        welcomeMessage: agent.welcomeMessage,
        active: agent.active,
        activeVersion: activeVersion
          ? {
              id: activeVersion.id,
              version: activeVersion.version,
              systemPrompt: activeVersion.systemPrompt,
            }
          : null,
      };
    });
  },
);

export function toAgentPublicView(agent: ResolvedAgent): AgentPublicView {
  return {
    id: agent.id,
    slug: agent.slug,
    name: agent.name,
    description: agent.description,
    locale: agent.locale,
    welcomeMessage: agent.welcomeMessage,
    active: agent.active,
  };
}
