import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { selectAssistantModel } =
  await import("@/features/assistant/server/assistant-model-selection");
const { defaultAiModelId } = await import("@/lib/ai/models");

describe("selectAssistantModel", () => {
  it("falls back to the app default model", async () => {
    const selection = await selectAssistantModel("org_1");

    expect(selection.model.id).toBe(defaultAiModelId);
    expect(selection.defaultModelId).toBe(defaultAiModelId);
  });

  it("uses the requested model when valid", async () => {
    const selection = await selectAssistantModel(
      "org_1",
      "llama-3.1-8b-instant",
    );

    expect(selection.model.id).toBe("llama-3.1-8b-instant");
  });

  it("rejects an unknown model", async () => {
    await expect(
      selectAssistantModel("org_1", "unknown-model"),
    ).rejects.toThrow("Unknown AI model: unknown-model");
  });
});
