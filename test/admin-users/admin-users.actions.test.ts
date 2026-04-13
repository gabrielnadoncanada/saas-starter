import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireAdminActionMock,
  headersMock,
  banUserMock,
  removeUserMock,
  revokeUserSessionsMock,
  setRoleMock,
} = vi.hoisted(() => ({
  requireAdminActionMock: vi.fn(),
  headersMock: vi.fn(),
  banUserMock: vi.fn(),
  removeUserMock: vi.fn(),
  revokeUserSessionsMock: vi.fn(),
  setRoleMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

vi.mock("@/features/auth/server/require-admin", () => ({
  requireAdminAction: requireAdminActionMock,
}));

vi.mock("@/shared/lib/auth/auth-config", () => ({
  auth: {
    api: {
      banUser: banUserMock,
      removeUser: removeUserMock,
      revokeUserSessions: revokeUserSessionsMock,
      setRole: setRoleMock,
      revokeUserSession: vi.fn(),
      unbanUser: vi.fn(),
    },
  },
}));

const {
  banUserAction,
  removeUserAction,
  revokeAllUserSessionsAction,
  setUserRoleAction,
} = await import("@/features/users/actions/admin-users.actions");

describe("admin-users.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminActionMock.mockResolvedValue("admin_1");
    headersMock.mockResolvedValue(new Headers());
  });

  it("blocks self-ban before calling the auth API", async () => {
    await expect(banUserAction("admin_1")).rejects.toThrow(
      "You cannot ban yourself",
    );
    expect(banUserMock).not.toHaveBeenCalled();
  });

  it("blocks self-deletion before calling the auth API", async () => {
    await expect(removeUserAction("admin_1")).rejects.toThrow(
      "You cannot delete your own account from the admin panel",
    );
    expect(removeUserMock).not.toHaveBeenCalled();
  });

  it("blocks self-role changes before calling the auth API", async () => {
    await expect(setUserRoleAction("admin_1", "user")).rejects.toThrow(
      "You cannot change your own role",
    );
    expect(setRoleMock).not.toHaveBeenCalled();
  });

  it("blocks revoking all of the admin's own sessions", async () => {
    await expect(revokeAllUserSessionsAction("admin_1")).rejects.toThrow(
      "You cannot revoke your own sessions from the admin panel",
    );
    expect(revokeUserSessionsMock).not.toHaveBeenCalled();
  });
});
