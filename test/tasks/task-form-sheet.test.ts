// @vitest-environment jsdom

import React from "react";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { refreshMock, useActionStateMock, useToastMessageMock } = vi.hoisted(
  () => ({
    refreshMock: vi.fn(),
    useActionStateMock: vi.fn(),
    useToastMessageMock: vi.fn(),
  }),
);

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    useActionState: useActionStateMock,
  };
});

vi.mock("@/shared/i18n/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

vi.mock("@/features/tasks/components/task-form", () => ({
  TaskForm: () => React.createElement("div", null, "Task form"),
}));

vi.mock("@/features/tasks/components/task-attachments-panel", () => ({
  TaskAttachmentsPanel: () => React.createElement("div", null, "Attachments"),
}));

vi.mock("@/features/tasks/server/task-server-actions", () => ({
  createTaskAction: vi.fn(),
  updateTaskAction: vi.fn(),
}));

vi.mock("@/shared/hooks/useToastMessage", () => ({
  useToastMessage: useToastMessageMock,
}));

import { TaskFormSheet } from "@/features/tasks/components/task-form-sheet";

describe("TaskFormSheet", () => {
  beforeEach(() => {
    refreshMock.mockReset();
    useActionStateMock.mockReset();
    useToastMessageMock.mockReset();
  });

  it("handles a successful create action once per action state", () => {
    let currentState: { success?: string } = { success: "Task created" };

    useActionStateMock.mockImplementation(() => [currentState, vi.fn(), false]);

    const firstOnOpenChange = vi.fn();
    const view = render(
      React.createElement(TaskFormSheet, {
        mode: "create",
        open: true,
        onOpenChange: firstOnOpenChange,
      }),
    );

    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(firstOnOpenChange).toHaveBeenCalledWith(false);

    const secondOnOpenChange = vi.fn();
    view.rerender(
      React.createElement(TaskFormSheet, {
        mode: "create",
        open: true,
        onOpenChange: secondOnOpenChange,
      }),
    );

    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(secondOnOpenChange).not.toHaveBeenCalled();

    currentState = { success: "Task created" };
    view.rerender(
      React.createElement(TaskFormSheet, {
        mode: "create",
        open: true,
        onOpenChange: secondOnOpenChange,
      }),
    );

    expect(refreshMock).toHaveBeenCalledTimes(2);
    expect(secondOnOpenChange).toHaveBeenCalledWith(false);
  });
});
