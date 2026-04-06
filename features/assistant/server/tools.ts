import "server-only";

import { tool } from "ai";
import { z } from "zod";

import type { CreateTaskToolResult } from "@/features/assistant/types";
import { createTask } from "@/features/tasks/server/task-mutations";

import { toAssistantToolFailure } from "./tool-result";

const createTaskInputSchema = z.object({
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
});

type CreateTaskInput = z.infer<typeof createTaskInputSchema>;

export const assistantTools = {
  createTask: tool({
    description:
      "Create a task in the task management system. Use this when the user asks to create a task, add a to-do, or track follow-ups.",
    inputSchema: createTaskInputSchema,
    execute: async (input: CreateTaskInput): Promise<CreateTaskToolResult> => {
      const { title, description, priority, label } = input;
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
