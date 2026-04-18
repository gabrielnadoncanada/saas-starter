import "server-only";

import { tool } from "ai";
import { z } from "zod";

import { setPublicConversationStatus } from "@/features/agents/server/public-conversations";
import type {
  AgentToolName,
  AssistantToolFailure,
  CreateLeadToolResult,
  LookupKnowledgeToolResult,
  RequestHumanToolResult,
  ScheduleCallbackToolResult,
} from "@/features/agents/types";
import { retrieveRelevantChunks } from "@/features/knowledge/server/retrieve";
import { createLeadFromConversation } from "@/features/leads/server/lead-mutations";

export type PublicChatToolContext = {
  organizationId: string;
  agentId: string;
  conversationId: string;
};

function toolFailure(error: unknown, code = "UNKNOWN"): AssistantToolFailure {
  return {
    success: false,
    error: {
      code,
      message: error instanceof Error ? error.message : "Something went wrong",
    },
  };
}

export function buildPublicChatTools(
  ctx: PublicChatToolContext,
  enabled: AgentToolName[],
) {
  const registry = {
    createLead: tool({
      description:
        "Save a qualified lead once the user has provided enough information (e.g. name, contact, need, budget, timeline). Pass structured qualification data. Only call when you have at least a contact method or a clear description of the project.",
      inputSchema: z.object({
        data: z
          .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
          .describe("Key/value qualification data from the conversation"),
        contactName: z.string().trim().max(120).optional(),
        contactEmail: z.string().email().max(255).optional(),
        contactPhone: z.string().trim().max(40).optional(),
        score: z
          .number()
          .int()
          .min(0)
          .max(100)
          .optional()
          .describe("Lead hotness score 0-100 based on fit and intent"),
        notes: z.string().trim().max(2000).optional(),
      }),
      execute: async (input): Promise<CreateLeadToolResult> => {
        try {
          const lead = await createLeadFromConversation({
            organizationId: ctx.organizationId,
            conversationId: ctx.conversationId,
            data: input.data,
            score: input.score ?? null,
            contactEmail: input.contactEmail ?? null,
            contactName: input.contactName ?? null,
            contactPhone: input.contactPhone ?? null,
            notes: input.notes ?? null,
          });
          const summary =
            input.contactName || input.contactEmail || input.contactPhone
              ? `Saved lead for ${input.contactName ?? input.contactEmail ?? input.contactPhone}.`
              : "Saved qualification data.";
          return { success: true, leadId: lead.id, summary };
        } catch (error) {
          return toolFailure(error);
        }
      },
    }),

    requestHuman: tool({
      description:
        "Request that a human team member take over the conversation. Use when the user explicitly asks for a human, when the question is outside your knowledge, or when the user shows frustration. Provide a short reason.",
      inputSchema: z.object({
        reason: z
          .string()
          .trim()
          .min(1)
          .max(500)
          .describe("Short explanation of why a human is needed"),
      }),
      execute: async (input): Promise<RequestHumanToolResult> => {
        try {
          await setPublicConversationStatus({
            organizationId: ctx.organizationId,
            conversationId: ctx.conversationId,
            status: "WAITING_HUMAN",
          });
          return {
            success: true,
            message: `A human teammate has been notified (${input.reason}). They will jump in shortly.`,
          };
        } catch (error) {
          return toolFailure(error);
        }
      },
    }),

    lookupKnowledge: tool({
      description:
        "Search the internal knowledge base for accurate information about products, specs, pricing, FAQ, or policies. ALWAYS use this before giving specific facts or numbers — do not guess.",
      inputSchema: z.object({
        query: z
          .string()
          .trim()
          .min(1)
          .max(500)
          .describe("Natural language search query"),
        topK: z.number().int().min(1).max(10).default(5).optional(),
      }),
      execute: async (input): Promise<LookupKnowledgeToolResult> => {
        try {
          const chunks = await retrieveRelevantChunks({
            organizationId: ctx.organizationId,
            agentId: ctx.agentId,
            query: input.query,
            topK: input.topK ?? 5,
          });
          return {
            success: true,
            results: chunks.map((c) => ({
              content: c.content,
              title: c.documentTitle,
              score: c.rerankScore ?? c.similarity,
            })),
          };
        } catch (error) {
          return toolFailure(error);
        }
      },
    }),

    scheduleCallback: tool({
      description:
        "Schedule a callback for the user. Requires name and either email or phone. Creates a lead and flags it for human follow-up.",
      inputSchema: z.object({
        contactName: z.string().trim().min(1).max(120),
        contactEmail: z.string().email().max(255).optional(),
        contactPhone: z.string().trim().min(4).max(40).optional(),
        preferredTime: z.string().trim().max(200).optional(),
        topic: z.string().trim().max(500).optional(),
      }),
      execute: async (input): Promise<ScheduleCallbackToolResult> => {
        try {
          if (!input.contactEmail && !input.contactPhone) {
            return toolFailure(
              new Error("Need either email or phone to schedule a callback"),
              "MISSING_CONTACT",
            );
          }
          const lead = await createLeadFromConversation({
            organizationId: ctx.organizationId,
            conversationId: ctx.conversationId,
            data: {
              type: "callback_request",
              preferredTime: input.preferredTime ?? null,
              topic: input.topic ?? null,
            },
            contactName: input.contactName,
            contactEmail: input.contactEmail ?? null,
            contactPhone: input.contactPhone ?? null,
            notes: `Callback requested${input.preferredTime ? ` for ${input.preferredTime}` : ""}${input.topic ? ` — ${input.topic}` : ""}`,
          });
          await setPublicConversationStatus({
            organizationId: ctx.organizationId,
            conversationId: ctx.conversationId,
            status: "WAITING_HUMAN",
          });
          return { success: true, leadId: lead.id };
        } catch (error) {
          return toolFailure(error);
        }
      },
    }),
  } satisfies Record<AgentToolName, unknown>;

  const filtered: Record<string, unknown> = {};
  for (const name of enabled) {
    const entry = (registry as Record<string, unknown>)[name];
    if (entry) filtered[name] = entry;
  }
  return filtered as Partial<typeof registry>;
}
