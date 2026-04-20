import "server-only";

import { tool } from "ai";
import type { UIMessage } from "ai";
import { z } from "zod";

import {
  createCorrection,
  deleteCorrection,
  listCorrections,
  toggleCorrectionExample,
} from "@/features/agents/server/correction-mutations";
import { createEvalCase } from "@/features/agents/server/evals/eval-mutations";
import {
  listEvalCases,
  listEvalRuns,
} from "@/features/agents/server/evals/eval-queries";
import { listKnowledgeDocuments } from "@/features/knowledge/server/document-mutations";
import { db } from "@/lib/db/prisma";
import { runInTenantScope } from "@/lib/db/tenant-scope";

export type CoachContext = {
  organizationId: string;
  agentId: string;
  userId: string;
};

function textOf(msg: { parts?: unknown }): string {
  const parts = Array.isArray(msg.parts) ? msg.parts : [];
  return parts
    .filter(
      (p): p is { type: "text"; text: string } =>
        typeof p === "object" &&
        p !== null &&
        "type" in p &&
        (p as { type: unknown }).type === "text" &&
        "text" in p &&
        typeof (p as { text: unknown }).text === "string",
    )
    .map((p) => p.text)
    .join("");
}

export function buildCoachTools(ctx: CoachContext) {
  return {
    // ---------- READ TOOLS ----------

    searchConversations: tool({
      description:
        "List recent conversations for this agent. Returns transcripts (truncated to 400 chars per message) so you can analyze patterns, find examples, or cite evidence. Filter by status if needed.",
      inputSchema: z.object({
        status: z
          .enum(["BOT", "WAITING_HUMAN", "HUMAN", "RESOLVED", "ABANDONED"])
          .optional()
          .describe("Filter by conversation status"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(30)
          .default(10)
          .describe("How many conversations to return (most recent first)"),
      }),
      execute: async ({ status, limit }) => {
        return runInTenantScope(ctx.organizationId, async () => {
          const convos = await db.publicConversation.findMany({
            where: { agentId: ctx.agentId, ...(status ? { status } : {}) },
            orderBy: { lastMessageAt: "desc" },
            take: limit,
            include: {
              lead: {
                select: {
                  contactEmail: true,
                  contactName: true,
                  score: true,
                },
              },
            },
          });
          return {
            count: convos.length,
            conversations: convos.map((c) => {
              const raw = Array.isArray(c.messagesJson)
                ? (c.messagesJson as unknown as UIMessage[])
                : [];
              return {
                id: c.id,
                status: c.status,
                visitorId: c.visitorId,
                lastMessageAt: c.lastMessageAt.toISOString(),
                lead: c.lead
                  ? {
                      name: c.lead.contactName,
                      email: c.lead.contactEmail,
                      score: c.lead.score,
                    }
                  : null,
                messageCount: raw.length,
                transcript: raw.map((m) => ({
                  id: m.id,
                  role: m.role,
                  text: textOf(m).slice(0, 400),
                })),
              };
            }),
          };
        });
      },
    }),

    listCorrections: tool({
      description:
        "List all existing corrections (few-shot examples). Use to audit, cluster, or find candidates to promote into the system prompt.",
      inputSchema: z.object({
        activeOnly: z
          .boolean()
          .default(false)
          .describe("Only return corrections where useAsExample=true"),
      }),
      execute: async ({ activeOnly }) => {
        const rows = await listCorrections(ctx.agentId, 200);
        const filtered = activeOnly ? rows.filter((r) => r.useAsExample) : rows;
        return {
          count: filtered.length,
          corrections: filtered.map((c) => ({
            id: c.id,
            userMessage: c.userMessage,
            originalMessage: c.originalMessage,
            correctedMessage: c.correctedMessage,
            useAsExample: c.useAsExample,
            createdAt: c.createdAt.toISOString(),
            createdBy: c.createdBy?.name ?? c.createdBy?.email ?? "unknown",
          })),
        };
      },
    }),

    listEvalCases: tool({
      description:
        "List all eval cases for this agent. An eval case is a question + expected answer + judge criteria used to score prompt versions.",
      inputSchema: z.object({}),
      execute: async () => {
        const rows = await listEvalCases(ctx.agentId);
        return {
          count: rows.length,
          cases: rows.map((c) => ({
            id: c.id,
            name: c.name,
            input: c.input,
            expectedOutput: c.expectedOutput,
            criteria: c.criteria,
            tags: c.tags,
            enabled: c.enabled,
          })),
        };
      },
    }),

    listEvalRuns: tool({
      description:
        "List recent eval runs (scores for the agent's prompt versions). Use to assess regression after a prompt update.",
      inputSchema: z.object({
        limit: z.number().int().min(1).max(20).default(5),
      }),
      execute: async ({ limit }) => {
        const runs = await listEvalRuns(ctx.agentId, limit);
        return {
          count: runs.length,
          runs: runs.map((r) => ({
            id: r.id,
            status: r.status,
            averageScore: r.averageScore,
            passedCases: r.passedCases,
            totalCases: r.totalCases,
            startedAt: r.startedAt.toISOString(),
            completedAt: r.completedAt?.toISOString() ?? null,
            agentVersion: r.agentVersion?.version ?? null,
          })),
        };
      },
    }),

    getKnowledgeDocuments: tool({
      description:
        "List uploaded knowledge documents for this agent. Use to check what RAG content is available before suggesting prompt changes.",
      inputSchema: z.object({}),
      execute: async () => {
        const docs = await listKnowledgeDocuments(ctx.agentId);
        return {
          count: docs.length,
          documents: docs.map((d) => ({
            id: d.id,
            title: d.title,
            status: d.status,
            chunkCount: d._count?.chunks ?? 0,
            createdAt: d.createdAt.toISOString(),
          })),
        };
      },
    }),

    getAgentVersions: tool({
      description:
        "List all prompt versions (active + drafts) for this agent, with their system prompts.",
      inputSchema: z.object({}),
      execute: async () => {
        return runInTenantScope(ctx.organizationId, async () => {
          const rows = await db.agentVersion.findMany({
            where: { agentId: ctx.agentId },
            orderBy: { version: "desc" },
          });
          return {
            count: rows.length,
            versions: rows.map((v) => ({
              id: v.id,
              version: v.version,
              active: v.active,
              evalScore: v.evalScore,
              notes: v.notes,
              systemPrompt: v.systemPrompt.slice(0, 4000),
              createdAt: v.createdAt.toISOString(),
            })),
          };
        });
      },
    }),

    explainMessage: tool({
      description:
        "Return debug context for a specific bot message: which prompt version answered, the preceding conversation, visitor lead info. Use this when asked why the bot gave a specific response.",
      inputSchema: z.object({
        conversationId: z.string(),
        messageId: z.string(),
      }),
      execute: async ({ conversationId, messageId }) => {
        return runInTenantScope(ctx.organizationId, async () => {
          const convo = await db.publicConversation.findFirst({
            where: { id: conversationId, agentId: ctx.agentId },
            include: {
              agentVersion: {
                select: { version: true, systemPrompt: true, active: true },
              },
              lead: { select: { contactName: true, contactEmail: true } },
            },
          });
          if (!convo) {
            return { success: false, error: "Conversation not found" };
          }
          const raw = Array.isArray(convo.messagesJson)
            ? (convo.messagesJson as unknown as UIMessage[])
            : [];
          const idx = raw.findIndex((m) => m.id === messageId);
          if (idx === -1) {
            return { success: false, error: "Message not found" };
          }
          const context = raw.slice(Math.max(0, idx - 4), idx + 1);
          return {
            success: true,
            target: {
              id: raw[idx].id,
              role: raw[idx].role,
              text: textOf(raw[idx]),
            },
            precedingContext: context.map((m) => ({
              id: m.id,
              role: m.role,
              text: textOf(m).slice(0, 600),
            })),
            conversationStatus: convo.status,
            agentVersion: convo.agentVersion
              ? {
                  version: convo.agentVersion.version,
                  active: convo.agentVersion.active,
                  systemPrompt: convo.agentVersion.systemPrompt.slice(0, 2000),
                }
              : null,
            lead: convo.lead ?? null,
          };
        });
      },
    }),

    // ---------- WRITE TOOLS ----------

    createCorrection: tool({
      description:
        "Save a new correction (few-shot example). Use AFTER the admin confirmed. Must reference a real assistant message id from a conversation. The user message that triggered the original answer is extracted automatically.",
      inputSchema: z.object({
        conversationId: z.string(),
        messageId: z
          .string()
          .describe(
            "The id of the ASSISTANT message being corrected (not the user's question)",
          ),
        correctedMessage: z.string().min(1).max(10_000),
        useAsExample: z.boolean().default(true),
      }),
      execute: async (input) => {
        try {
          const res = await createCorrection({
            conversationId: input.conversationId,
            messageId: input.messageId,
            correctedMessage: input.correctedMessage,
            useAsExample: input.useAsExample,
          });
          return {
            success: true,
            correctionId: res.id,
            note: "Correction saved. It will be retrieved as a few-shot example for similar future questions.",
          };
        } catch (err) {
          return {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
          };
        }
      },
    }),

    toggleCorrectionExample: tool({
      description:
        "Enable or disable a correction as a few-shot example (without deleting it). Useful when a correction becomes outdated.",
      inputSchema: z.object({
        correctionId: z.string(),
        useAsExample: z.boolean(),
      }),
      execute: async ({ correctionId, useAsExample }) => {
        await toggleCorrectionExample(correctionId, useAsExample);
        return { success: true, correctionId, useAsExample };
      },
    }),

    deleteCorrection: tool({
      description:
        "Permanently delete a correction. Destructive — only call after the admin explicitly says 'delete' or 'remove' that specific correction.",
      inputSchema: z.object({
        correctionId: z.string(),
      }),
      execute: async ({ correctionId }) => {
        await deleteCorrection(correctionId);
        return { success: true, deleted: correctionId };
      },
    }),

    createEvalCase: tool({
      description:
        "Create an eval case to lock in expected behavior as a regression test. Use after a correction has proven valuable (so it survives prompt rewrites).",
      inputSchema: z.object({
        name: z.string().min(1).max(120),
        input: z.string().min(1).max(2_000),
        expectedOutput: z.string().min(1).max(4_000),
        criteria: z
          .string()
          .max(2_000)
          .default("")
          .describe("Judge instructions — what makes a response pass"),
        tags: z.array(z.string()).default([]),
      }),
      execute: async (input) => {
        const res = await createEvalCase({
          agentId: ctx.agentId,
          name: input.name,
          input: input.input,
          expectedOutput: input.expectedOutput,
          criteria: input.criteria,
          tags: input.tags,
        });
        return { success: true, caseId: res.id };
      },
    }),

    proposePromptUpdate: tool({
      description:
        "Create a new DRAFT prompt version (NOT activated). The admin reviews it in the Versions tab and activates manually. Always include a short `notes` explaining what changed and why.",
      inputSchema: z.object({
        newSystemPrompt: z
          .string()
          .min(50)
          .max(20_000)
          .describe("Full new system prompt (replaces the active one)"),
        notes: z
          .string()
          .min(5)
          .max(1_000)
          .describe("Short changelog: what changed + why"),
      }),
      execute: async ({ newSystemPrompt, notes }) => {
        return runInTenantScope(ctx.organizationId, async () => {
          const latest = await db.agentVersion.findFirst({
            where: { agentId: ctx.agentId },
            orderBy: { version: "desc" },
            select: { version: true },
          });
          const nextVersion = (latest?.version ?? 0) + 1;
          const created = await db.agentVersion.create({
            data: {
              agentId: ctx.agentId,
              version: nextVersion,
              systemPrompt: newSystemPrompt,
              notes,
              active: false,
              createdByUserId: ctx.userId,
            },
          });
          return {
            success: true,
            versionId: created.id,
            version: nextVersion,
            note: "Draft created. Admin must activate it via the Versions tab after review.",
          };
        });
      },
    }),
  } as const;
}
