import { beforeEach, describe, expect, it, vi } from "vitest";

const { headersMock, signOutMock, deleteAccountMock } = vi.hoisted(() => ({
  headersMock: vi.fn(),
  signOutMock: vi.fn(),
  deleteAccountMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

vi.mock("@/features/account/server/delete-account", () => ({
  deleteAccount: deleteAccountMock,
}));

vi.mock("@/lib/auth/auth-config", () => ({
  auth: {
    api: {
      signOut: signOutMock,
    },
  },
}));

vi.mock("@/lib/auth/authenticated-action", () => ({
  validatedAuthenticatedAction: (_schema: unknown, action: unknown) => {
    const fn = action as (
      data: unknown,
      context: {
        formData: FormData;
        user: { id: string; email: string };
      },
    ) => Promise<unknown>;
    return async (_prevState: unknown, formData: FormData) =>
      fn(
        {},
        {
          formData,
          user: { id: "user_1", email: "user@example.com" },
        },
      );
  },
}));

const { deleteAccountAction } =
  await import("@/features/account/actions/delete-account.actions");

describe("deleteAccountAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headersMock.mockResolvedValue(new Headers({ cookie: "session=1" }));
  });

  it("signs the user out after a successful deletion", async () => {
    deleteAccountMock.mockResolvedValue({
      success: "Account deleted successfully.",
    });

    const result = await deleteAccountAction({}, new FormData());

    expect(deleteAccountMock).toHaveBeenCalledWith({
      userEmail: "user@example.com",
      userId: "user_1",
      requestHeaders: expect.any(Headers),
    });
    expect(signOutMock).toHaveBeenCalledWith({
      headers: expect.any(Headers),
    });
    expect(result).toEqual({
      success: "Account deleted successfully.",
    });
  });

  it("returns the blocker without signing out", async () => {
    deleteAccountMock.mockResolvedValue({
      error: "Leave your organization before deleting your account.",
    });

    const result = await deleteAccountAction({}, new FormData());

    expect(signOutMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      error: "Leave your organization before deleting your account.",
    });
  });
});
