import "server-only";

import { tool } from "ai";
import { z } from "zod";

import type {
  CreateInvoiceDraftToolResult,
  CreateTaskToolResult,
  ReviewInboxToolResult,
} from "@/features/assistant/types";
import { getOrganizationPlan } from "@/features/billing/guards/get-organization-plan";
import { assertCapability } from "@/features/billing/guards/plan-guards";
import { consumeMonthlyUsage } from "@/features/billing/usage/usage-service";
import { createTaskForCurrentOrganization } from "@/features/tasks/server/task-mutations";

import { assistantDemoInbox } from "./demo-inbox";
import { toAssistantToolFailure } from "./tool-result";

type InvoiceDraftInput = {
  clientName: string;
  clientEmail?: string;
  items: Array<{ description: string; quantity: number; unitPrice: number }>;
  notes?: string;
  dueInDays?: number;
};

async function getToolOrganizationPlan() {
  const organizationPlan = await getOrganizationPlan();

  if (!organizationPlan) {
    throw new Error("Organization not found");
  }

  return organizationPlan;
}

export const assistantTools = {
  reviewInbox: tool({
    description:
      "Fetch recent emails from the user's inbox. Use this when the user asks to review emails, check their inbox, or wants task suggestions based on emails.",
    inputSchema: z.object({
      limit: z
        .number()
        .min(1)
        .max(10)
        .optional()
        .describe("Number of recent emails to fetch (default 5)"),
    }),
    execute: async ({
      limit,
    }: {
      limit?: number;
    }): Promise<ReviewInboxToolResult> => {
      try {
        const organizationPlan = await getToolOrganizationPlan();
        assertCapability(organizationPlan.planId, "email.sync");
        const messages = await assistantDemoInbox.getRecentMessages(limit ?? 5);

        await consumeMonthlyUsage(
          organizationPlan.organizationId,
          "emailSyncsPerMonth",
          organizationPlan.planId,
        );

        return {
          success: true,
          result: {
            provider: assistantDemoInbox.name,
            messages,
            count: messages.length,
          },
        };
      } catch (error) {
        return toAssistantToolFailure(error);
      }
    },
  }),

  createTask: tool({
    description:
      "Create a task in the task management system. Use this when the user asks to create a task, add a to-do, or when suggesting tasks from email review.",
    inputSchema: z.object({
      title: z.string().min(1).max(255).describe("Task title"),
      description: z
        .string()
        .max(5000)
        .optional()
        .describe("Optional task description"),
      priority: z
        .enum(["LOW", "MEDIUM", "HIGH"])
        .optional()
        .describe("Task priority (default MEDIUM)"),
      label: z
        .enum(["FEATURE", "BUG", "DOCUMENTATION"])
        .optional()
        .describe("Task label (default FEATURE)"),
    }),
    execute: async ({
      title,
      description,
      priority,
      label,
    }: {
      title: string;
      description?: string;
      priority?: "LOW" | "MEDIUM" | "HIGH";
      label?: "FEATURE" | "BUG" | "DOCUMENTATION";
    }): Promise<CreateTaskToolResult> => {
      try {
        const task = await createTaskForCurrentOrganization({
          title,
          description,
          priority: priority ?? "MEDIUM",
          label: label ?? "FEATURE",
        });

        return {
          success: true,
          result: {
            taskCode: task.code,
            title: task.title,
            status: task.status,
          },
        };
      } catch (error) {
        return toAssistantToolFailure(error);
      }
    },
  }),

  createInvoiceDraft: tool({
    description:
      "Create an invoice draft from a natural language description. Use this when the user asks to create, draft, or generate an invoice.",
    inputSchema: z.object({
      clientName: z.string().describe("Name of the client to invoice"),
      clientEmail: z
        .string()
        .email()
        .optional()
        .describe("Client email address"),
      items: z
        .array(
          z.object({
            description: z.string().describe("Line item description"),
            quantity: z.number().min(1).describe("Quantity"),
            unitPrice: z.number().min(0).describe("Price per unit in dollars"),
          }),
        )
        .min(1)
        .describe("Invoice line items"),
      notes: z.string().optional().describe("Additional notes for the invoice"),
      dueInDays: z
        .number()
        .min(1)
        .max(90)
        .optional()
        .describe("Payment due in N days (default 30)"),
    }),
    execute: async ({
      clientName,
      clientEmail,
      items,
      notes,
      dueInDays,
    }: InvoiceDraftInput): Promise<CreateInvoiceDraftToolResult> => {
      try {
        const organizationPlan = await getToolOrganizationPlan();
        assertCapability(organizationPlan.planId, "invoice.create");

        const subtotal = items.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice,
          0,
        );
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (dueInDays ?? 30));

        return {
          success: true,
          result: {
            invoiceNumber: `INV-${Date.now().toString(36).toUpperCase()}`,
            clientName,
            clientEmail: clientEmail ?? null,
            items: items.map((item) => ({
              ...item,
              total: item.quantity * item.unitPrice,
            })),
            subtotal,
            dueDate: dueDate.toISOString().split("T")[0],
            notes: notes ?? null,
            currency: "USD",
          },
        };
      } catch (error) {
        return toAssistantToolFailure(error);
      }
    },
  }),
};
