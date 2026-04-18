"use server";

import type { UIMessage } from "ai";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  activateAgentVersionSchema,
  createAgentSchema,
  createAgentVersionSchema,
  deleteAgentSchema,
  updateAgentSchema,
} from "@/features/agents/schemas/agent.schema";
import {
  sendHumanReplySchema,
  takeOverConversationSchema,
} from "@/features/agents/schemas/public-chat.schema";
import {
  activateAgentVersion,
  createAgent,
  createAgentVersion,
  deleteAgent,
  setAgentActive,
  updateAgent,
} from "@/features/agents/server/agent-mutations";
import { getAgentConversation } from "@/features/agents/server/conversation-queries";
import {
  releaseConversationToBot,
  resolveConversation,
  sendHumanReply,
  takeOverConversation,
} from "@/features/agents/server/handoff";
import { requireActiveOrganizationMembership } from "@/features/organizations/server/organizations";

function parse<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const first =
      parsed.error.issues[0]?.message ?? "Invalid input";
    throw new Error(first);
  }
  return parsed.data;
}

export async function createAgentAction(input: z.input<typeof createAgentSchema>) {
  await requireActiveOrganizationMembership();
  const data = parse(createAgentSchema, input);
  const agent = await createAgent(data);
  revalidatePath("/agents");
  return { id: agent.id };
}

export async function updateAgentAction(input: z.input<typeof updateAgentSchema>) {
  await requireActiveOrganizationMembership();
  const data = parse(updateAgentSchema, input);
  await updateAgent(data);
  revalidatePath(`/agents/${data.agentId}`);
}

export async function deleteAgentAction(input: z.input<typeof deleteAgentSchema>) {
  await requireActiveOrganizationMembership();
  const { agentId } = parse(deleteAgentSchema, input);
  await deleteAgent(agentId);
  revalidatePath("/agents");
}

export async function toggleAgentActiveAction(input: { agentId: string; active: boolean }) {
  await requireActiveOrganizationMembership();
  await setAgentActive(input.agentId, input.active);
  revalidatePath(`/agents/${input.agentId}`);
}

export async function createAgentVersionAction(
  input: z.input<typeof createAgentVersionSchema>,
) {
  await requireActiveOrganizationMembership();
  const data = parse(createAgentVersionSchema, input);
  const version = await createAgentVersion(data);
  revalidatePath(`/agents/${data.agentId}`);
  return { id: version.id };
}

export async function activateAgentVersionAction(
  input: z.input<typeof activateAgentVersionSchema>,
) {
  await requireActiveOrganizationMembership();
  const { agentId, versionId } = parse(activateAgentVersionSchema, input);
  await activateAgentVersion(agentId, versionId);
  revalidatePath(`/agents/${agentId}`);
}

export async function takeOverConversationAction(
  input: z.input<typeof takeOverConversationSchema>,
) {
  const { conversationId } = parse(takeOverConversationSchema, input);
  await takeOverConversation(conversationId);
  revalidatePath(`/agents`);
}

export async function releaseConversationAction(input: { conversationId: string }) {
  await releaseConversationToBot(input.conversationId);
  revalidatePath(`/agents`);
}

export async function resolveConversationAction(input: { conversationId: string }) {
  await resolveConversation(input.conversationId);
  revalidatePath(`/agents`);
}

export async function sendHumanReplyAction(
  input: z.input<typeof sendHumanReplySchema>,
) {
  const data = parse(sendHumanReplySchema, input);
  await sendHumanReply(data);
  revalidatePath(`/agents`);
}

export async function getConversationMessagesAction(input: {
  conversationId: string;
}): Promise<{
  status: string;
  messages: Array<{ id: string; role: string; text: string; sender: string | null }>;
}> {
  await requireActiveOrganizationMembership();
  const convo = await getAgentConversation(input.conversationId);
  if (!convo) throw new Error("Conversation not found");
  const raw = Array.isArray(convo.messagesJson)
    ? (convo.messagesJson as unknown as UIMessage[])
    : [];
  const messages = raw.map((m) => {
    const text = (m.parts ?? [])
      .filter((p) => p.type === "text")
      .map((p) => ("text" in p ? (p as { text: string }).text : ""))
      .join("");
    const meta = (m.metadata ?? {}) as { sender?: string };
    return { id: m.id, role: m.role, text, sender: meta.sender ?? null };
  });
  return { status: convo.status, messages };
}
