import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CreateTaskToolResult } from "@/features/assistant/types";

vi.mock("ai", () => ({
  tool: <T>(definition: T) => definition,
}));

vi.mock("@/features/billing/server/organization-entitlements", () => ({
  getCurrentEntitlements: vi.fn(),
}));

vi.mock("@/features/billing/server/usage-service", () => ({
  consumeMonthlyUsage: vi.fn(),
}));

vi.mock("@/features/tasks/server/task-mutations", () => ({
  createTask: vi.fn(),
}));

const { createTask } =
  await import("@/features/tasks/server/task-mutations");
const { assistantTools } = await import("@/features/assistant/server/tools");

const createTaskExecute = assistantTools.createTask.execute as (input: {
  title: string;
  description?: string;
  label?: "FEATURE" | "BUG" | "DOCUMENTATION";
  priority?: "LOW" | "MEDIUM" | "HIGH";
}) => Promise<CreateTaskToolResult>;

describe("assistant tools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates tasks through the shared guarded task contract", async () => {
    vi.mocked(createTask).mockResolvedValue({
      code: "TASK-52",
      title: "Follow up with client",
      status: "TODO",
    } as never);

    const result = await createTaskExecute({
      title: "Follow up with client",
      label: "FEATURE",
      priority: "HIGH",
    });

    expect(createTask).toHaveBeenCalledWith({
      title: "Follow up with client",
      description: undefined,
      label: "FEATURE",
      priority: "HIGH",
    });
    expect(result.success).toBe(true);
  });
});
