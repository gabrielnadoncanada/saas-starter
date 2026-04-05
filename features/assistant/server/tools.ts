import "server-only";

import { tool } from "ai";
import { z } from "zod";

import type { CreateTaskToolResult } from "@/features/assistant/types";
import { createTask } from "@/features/tasks/server/task-mutations";

import { toAssistantToolFailure } from "./tool-result";

export const assistantTools = {
  createTask: tool({
    description:
      "Create a task in the task management system. Use this when the user asks to create a task, add a to-do, or track follow-ups.",
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
        const task = await createTask({
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
};
