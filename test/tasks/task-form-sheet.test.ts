// @vitest-environment jsdom

import { render } from "@testing-library/react";
import React from "react";
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

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

vi.mock("@/features/tasks/actions/task.actions", () => ({
  createTaskAction: vi.fn(),
  updateTaskAction: vi.fn(),
}));

vi.mock("@/shared/hooks/use-toast-message", () => ({
  useToastMessage: useToastMessageMock,
}));

vi.mock("@/shared/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  SheetContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  SheetHeader: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  SheetTitle: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  SheetDescription: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  SheetFooter: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  SheetClose: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
}));

vi.mock("@/shared/components/billing/upgrade-prompt", () => ({
  UpgradePrompt: () => null,
}));

vi.mock("@/shared/lib/get-field-state", () => ({
  getFieldState: () => ({ error: undefined, invalid: false, value: "" }),
}));

import { TaskForm } from "@/features/tasks/components/task-form";

describe("TaskForm", () => {
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
      React.createElement(TaskForm, {
        mode: "create",
        open: true,
        onOpenChange: firstOnOpenChange,
      }),
    );

    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(firstOnOpenChange).toHaveBeenCalledWith(false);

    const secondOnOpenChange = vi.fn();
    view.rerender(
      React.createElement(TaskForm, {
        mode: "create",
        open: true,
        onOpenChange: secondOnOpenChange,
      }),
    );

    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(secondOnOpenChange).not.toHaveBeenCalled();

    currentState = { success: "Task created" };
    view.rerender(
      React.createElement(TaskForm, {
        mode: "create",
        open: true,
        onOpenChange: secondOnOpenChange,
      }),
    );

    expect(refreshMock).toHaveBeenCalledTimes(2);
    expect(secondOnOpenChange).toHaveBeenCalledWith(false);
  });
});
