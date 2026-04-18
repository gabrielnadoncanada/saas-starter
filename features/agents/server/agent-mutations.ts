import "server-only";

import type { Prisma } from "@prisma/client";

import type {
  CreateAgentValues,
  CreateAgentVersionValues,
  UpdateAgentValues,
} from "@/features/agents/schemas/agent.schema";
import { requireActiveOrganizationMembership } from "@/features/organizations/server/organizations";
import { db } from "@/lib/db/prisma";

const DEFAULT_SYSTEM_PROMPT = `You are a helpful assistant for {{organizationName}}.
Be concise and answer in {{locale}}.
Use available tools to qualify leads, look up information, or request human help when appropriate.`;

export async function createAgent(input: CreateAgentValues) {
  const membership = await requireActiveOrganizationMembership();

  const existing = await db.agent.findFirst({
    where: { slug: input.slug },
    select: { id: true },
  });

  if (existing) {
    throw new Error(`An agent with slug "${input.slug}" already exists.`);
  }

  const agent = await db.agent.create({
    data: {
      organizationId: membership.organizationId,
      slug: input.slug,
      name: input.name,
      description: input.description ?? null,
      locale: input.locale,
      modelId: input.modelId,
      toolsEnabled: input.toolsEnabled,
      qualificationSchema:
        (input.qualificationSchema as Prisma.InputJsonValue | undefined) ?? {},
      welcomeMessage: input.welcomeMessage ?? null,
    },
  });

  await db.agentVersion.create({
    data: {
      agentId: agent.id,
      version: 1,
      systemPrompt: input.systemPrompt || DEFAULT_SYSTEM_PROMPT,
      active: true,
      createdByUserId: null,
    },
  });

  return agent;
}

export async function updateAgent(input: UpdateAgentValues) {
  await requireActiveOrganizationMembership();

  const { agentId, systemPrompt, qualificationSchema, ...data } = input;

  const updateData: Prisma.AgentUpdateInput = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description ?? null;
  if (data.locale !== undefined) updateData.locale = data.locale;
  if (data.modelId !== undefined) updateData.modelId = data.modelId;
  if (data.toolsEnabled !== undefined) updateData.toolsEnabled = data.toolsEnabled;
  if (data.welcomeMessage !== undefined)
    updateData.welcomeMessage = data.welcomeMessage ?? null;
  if (qualificationSchema !== undefined)
    updateData.qualificationSchema =
      qualificationSchema as Prisma.InputJsonValue;

  const { count } = await db.agent.updateMany({
    where: { id: agentId },
    data: updateData,
  });

  if (count === 0) throw new Error("Agent not found");

  if (systemPrompt) {
    await createAgentVersion({ agentId, systemPrompt, activate: true });
  }
}

export async function deleteAgent(agentId: string) {
  await requireActiveOrganizationMembership();
  const { count } = await db.agent.deleteMany({ where: { id: agentId } });
  if (count === 0) throw new Error("Agent not found");
}

export async function setAgentActive(agentId: string, active: boolean) {
  await requireActiveOrganizationMembership();
  await db.agent.updateMany({ where: { id: agentId }, data: { active } });
}

export async function createAgentVersion(input: CreateAgentVersionValues) {
  await requireActiveOrganizationMembership();

  const agent = await db.agent.findFirst({
    where: { id: input.agentId },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  });

  if (!agent) throw new Error("Agent not found");

  const nextVersion = (agent.versions[0]?.version ?? 0) + 1;

  if (input.activate) {
    await db.agentVersion.updateMany({
      where: { agentId: input.agentId, active: true },
      data: { active: false },
    });
  }

  return db.agentVersion.create({
    data: {
      agentId: input.agentId,
      version: nextVersion,
      systemPrompt: input.systemPrompt,
      notes: input.notes ?? null,
      active: input.activate,
    },
  });
}

export async function activateAgentVersion(agentId: string, versionId: string) {
  await requireActiveOrganizationMembership();

  await db.$transaction(async (tx) => {
    await tx.agentVersion.updateMany({
      where: { agentId, active: true },
      data: { active: false },
    });
    await tx.agentVersion.update({
      where: { id: versionId },
      data: { active: true },
    });
  });
}
