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

vi.mock("@/hooks/use-toast-message", () => ({
  useToastMessage: useToastMessageMock,
}));

vi.mock("@/components/ui/drawer", () => ({
  Drawer: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  DrawerContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  DrawerHeader: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  DrawerTitle: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  DrawerDescription: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  DrawerFooter: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  DrawerClose: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
}));

vi.mock("@/components/billing/upgrade-prompt", () => ({
  UpgradePrompt: () => null,
}));

vi.mock("@/lib/get-field-state", () => ({
  getFieldState: () => ({ error: undefined, invalid: false, value: "" }),
}));

import { TaskFormDrawer } from "@/features/tasks/components/task-form-drawer";

describe("TaskFormDrawer", () => {
  beforeEach(() => {
    refreshMock.mockReset();
    useActionStateMock.mockReset();
    useToastMessageMock.mockReset();
  });

  it("handles a successful action once per action state", () => {
    let currentState: { success?: string } = { success: "Task created" };

    useActionStateMock.mockImplementation(() => [currentState, vi.fn(), false]);

    const firstOnOpenChange = vi.fn();
    const view = render(
      React.createElement(TaskFormDrawer, {
        open: true,
        onOpenChange: firstOnOpenChange,
      }),
    );

    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(firstOnOpenChange).toHaveBeenCalledWith(false);

    const secondOnOpenChange = vi.fn();
    view.rerender(
      React.createElement(TaskFormDrawer, {
        open: true,
        onOpenChange: secondOnOpenChange,
      }),
    );

    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(secondOnOpenChange).not.toHaveBeenCalled();

    currentState = { success: "Task created" };
    view.rerender(
      React.createElement(TaskFormDrawer, {
        open: true,
        onOpenChange: secondOnOpenChange,
      }),
    );

    expect(refreshMock).toHaveBeenCalledTimes(2);
    expect(secondOnOpenChange).toHaveBeenCalledWith(false);
  });
});
