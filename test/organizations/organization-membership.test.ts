import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({}),
}));
vi.mock("@/shared/lib/auth/get-current-user", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/shared/lib/auth/auth-config", () => ({
  auth: {
    api: {
      getActiveMember: vi.fn(),
    },
  },
}));

const { getCurrentUser } = await import("@/shared/lib/auth/get-current-user");
const { auth } = await import("@/shared/lib/auth/auth-config");
const {
  getActiveOrganizationMembership,
  OrganizationMembershipError,
  requireActiveOrganizationMembership,
  requireActiveOrganizationRole,
} = await import("@/features/organizations/server/organizations");

describe("organization membership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when the user is not authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    await expect(getActiveOrganizationMembership()).resolves.toBeNull();
    expect(auth.api.getActiveMember).not.toHaveBeenCalled();
  });

  it("throws when there is no active organization membership", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "user_1",
    } as never);
    vi.mocked(auth.api.getActiveMember).mockResolvedValue(null as never);

    await expect(requireActiveOrganizationMembership()).rejects.toEqual(
      expect.objectContaining({
        message: "User is not part of an organization",
      }),
    );
  });

  it("throws when the active member does not have the required role", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "user_1",
    } as never);
    vi.mocked(auth.api.getActiveMember).mockResolvedValue({
      organizationId: "org_1",
      role: "member",
    } as never);

    await expect(requireActiveOrganizationRole(["owner"])).rejects.toEqual(
      expect.objectContaining({
        message: "You do not have permission to perform this action",
      }),
    );
  });

  it("returns the active organization id and parsed roles", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "user_1",
    } as never);
    vi.mocked(auth.api.getActiveMember).mockResolvedValue({
      organizationId: "org_1",
      role: "owner,admin",
    } as never);

    await expect(requireActiveOrganizationMembership()).resolves.toEqual({
      organizationId: "org_1",
      roles: ["owner", "admin"],
      primaryRole: "owner",
    });
  });
});
