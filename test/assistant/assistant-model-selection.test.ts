import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("@/features/assistant/server/organization-ai-settings", () => ({
  getOrganizationAiSettings: vi.fn(),
}));

const { getOrganizationAiSettings } =
  await import("@/features/assistant/server/organization-ai-settings");
const { resolveOrganizationAssistantModelSelection } =
  await import("@/features/assistant/server/assistant-model-selection");

describe("resolveOrganizationAssistantModelSelection", () => {
  it("falls back to the organization default model", async () => {
    vi.mocked(getOrganizationAiSettings).mockResolvedValue({
      organizationId: "org_1",
      allowedModelIds: ["gemini-2.5-flash", "llama-3.1-8b-instant"],
      defaultModelId: "llama-3.1-8b-instant",
    });

    const selection =
      await resolveOrganizationAssistantModelSelection("org_1");

    expect(selection.model.id).toBe("llama-3.1-8b-instant");
  });

  it("rejects an unknown model", async () => {
    vi.mocked(getOrganizationAiSettings).mockResolvedValue({
      organizationId: "org_1",
      allowedModelIds: ["gemini-2.5-flash"],
      defaultModelId: "gemini-2.5-flash",
    });

    await expect(
      resolveOrganizationAssistantModelSelection("org_1", "unknown-model"),
    ).rejects.toThrow("Unknown AI model: unknown-model");
  });

  it("rejects a model that is not allowed for the organization", async () => {
    vi.mocked(getOrganizationAiSettings).mockResolvedValue({
      organizationId: "org_1",
      allowedModelIds: ["gemini-2.5-flash"],
      defaultModelId: "gemini-2.5-flash",
    });

    await expect(
      resolveOrganizationAssistantModelSelection(
        "org_1",
        "llama-3.1-8b-instant",
      ),
    ).rejects.toThrow(
      "This AI model is not allowed for the current organization.",
    );
  });
});
