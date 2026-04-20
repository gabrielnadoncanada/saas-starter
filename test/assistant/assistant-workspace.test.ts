// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import type { AssistantConversation } from "@/features/assistant/schemas/conversation-api.schema";

const { latestProps, replaceMock } = vi.hoisted(() => ({
  latestProps: { current: null as null | Record<string, unknown> },
  replaceMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

vi.mock("@/features/assistant/components/assistant-chat", () => ({
  AssistantChat: (props: Record<string, unknown>) => {
    latestProps.current = props;

    return React.createElement(
      "div",
      null,
      React.createElement("div", {
        "data-conversation-id": String(props.conversationId ?? ""),
        "data-reset-key": String(props.resetKey ?? ""),
        "data-testid": "assistant-chat",
      }),
      React.createElement(
        "button",
        {
          onClick: () => {
            (props.onConversationCreated as (conversation: AssistantConversation) => void)({
              id: "conv_1",
              lastMessageAt: "2026-04-06T12:00:00.000Z",
              messages: [
                {
                  id: "msg_1",
                  parts: [{ text: "Hello", type: "text" }],
                  role: "user",
                },
              ],
              preview: "Hello",
              title: "Hello",
            });
          },
          type: "button",
        },
        "create",
      ),
    );
  },
}));

import { routes } from "@/constants/routes";
import { AssistantWorkspace } from "@/features/assistant/components/assistant-workspace";

describe("AssistantWorkspace", () => {
  it("keeps a locally created conversation selected until route props catch up", async () => {
    replaceMock.mockReset();

    const view = render(
      React.createElement(AssistantWorkspace, {
        currentPlanName: "Pro",
        initialConversation: null,
        initialConversationId: null,
        initialDefaultModelId: "gemini-2.5-flash",
        initialModelOptions: [
          {
            id: "gemini-2.5-flash",
            name: "Gemini 2.5 Flash",
            provider: "google",
            providerLabel: "Google",
          },
        ],
        upgradeBillingInterval: "month",
        upgradePlanId: "team",
        upgradePlanName: "Team",
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "create" }));

    await waitFor(() => {
      expect(
        screen.getByTestId("assistant-chat").getAttribute("data-conversation-id"),
      ).toBe("conv_1");
    });

    expect(
      screen.getByTestId("assistant-chat").getAttribute("data-reset-key"),
    ).toBe("0");
    expect(replaceMock).toHaveBeenCalledWith(
      `${routes.app.assistant}?conversationId=conv_1`,
      { scroll: false },
    );

    view.rerender(
      React.createElement(AssistantWorkspace, {
        currentPlanName: "Pro",
        initialConversation: {
          id: "conv_1",
          lastMessageAt: "2026-04-06T12:00:00.000Z",
          messages: [
            {
              id: "msg_1",
              parts: [{ text: "Hello", type: "text" }],
              role: "user",
            },
          ],
          preview: "Hello",
          title: "Hello",
        },
        initialConversationId: "conv_1",
        initialDefaultModelId: "gemini-2.5-flash",
        initialModelOptions: [
          {
            id: "gemini-2.5-flash",
            name: "Gemini 2.5 Flash",
            provider: "google",
            providerLabel: "Google",
          },
        ],
        upgradeBillingInterval: "month",
        upgradePlanId: "team",
        upgradePlanName: "Team",
      }),
    );

    expect(
      screen.getByTestId("assistant-chat").getAttribute("data-conversation-id"),
    ).toBe("conv_1");
    expect(
      screen.getByTestId("assistant-chat").getAttribute("data-reset-key"),
    ).toBe("0");
    expect(latestProps.current?.conversationId).toBe("conv_1");
  });
});
