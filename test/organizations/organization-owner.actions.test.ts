import { beforeEach, describe, expect, it, vi } from "vitest";

import { LimitReachedError } from "@/features/billing/billing-errors";

const {
  headersMock,
  getCurrentOrganizationEntitlementsMock,
  assertCapabilityMock,
  assertLimitMock,
  inviteOrganizationMemberMock,
  listMembersMock,
  listInvitationsMock,
  requireActiveOrganizationRoleMock,
} = vi.hoisted(() => ({
  headersMock: vi.fn(),
  getCurrentOrganizationEntitlementsMock: vi.fn(),
  assertCapabilityMock: vi.fn(),
  assertLimitMock: vi.fn(),
  inviteOrganizationMemberMock: vi.fn(),
  listMembersMock: vi.fn(),
  listInvitationsMock: vi.fn(),
  requireActiveOrganizationRoleMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

vi.mock("@/shared/lib/auth/authenticated-action", () => ({
  validatedAuthenticatedAction: (_schema: unknown, action: unknown) => {
    const fn = action as (
      data: { email: string; role: "member" | "admin" },
      formData: FormData,
      user: { id: string; email: string },
    ) => Promise<unknown>;
    return async (_prevState: unknown, formData: FormData) => {
      const raw = Object.fromEntries(formData.entries());
      const data = {
        email: String(raw.email ?? ""),
        role: raw.role as "member" | "admin",
      };
      return fn(data, formData, { id: "owner_1", email: "owner@example.com" });
    };
  },
}));

vi.mock("@/features/organizations/server/organization-membership", () => ({
  requireActiveOrganizationRole: requireActiveOrganizationRoleMock,
  OrganizationMembershipError: class extends Error {
    name = "OrganizationMembershipError";
  },
}));

vi.mock("@/features/billing/server/organization-entitlements", () => ({
  getCurrentOrganizationEntitlements: getCurrentOrganizationEntitlementsMock,
}));

vi.mock("@/features/billing/plan-guards", () => ({
  assertCapability: assertCapabilityMock,
  assertLimit: assertLimitMock,
}));

vi.mock("@/features/organizations/server/organization-invitations", () => ({
  cancelOrganizationInvitation: vi.fn(),
  inviteOrganizationMember: inviteOrganizationMemberMock,
  resendOrganizationInvitation: vi.fn(),
}));

vi.mock("@/shared/lib/auth/auth-config", () => ({
  auth: {
    api: {
      listInvitations: listInvitationsMock,
      listMembers: listMembersMock,
      removeMember: vi.fn(),
      updateOrganization: vi.fn(),
    },
  },
}));

const { inviteOrganizationMemberAction } =
  await import("@/features/organizations/actions/membership.actions");

const entitlements = {
  organizationId: "org_1",
  planId: "pro",
  planName: "Pro",
  limits: { tasksPerMonth: 1000, teamMembers: 5, storageMb: 5000 },
  capabilities: ["team.invite"],
  billingInterval: "month",
  oneTimeProductIds: [],
  pricingModel: "flat",
  seats: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  subscriptionStatus: "active",
} as const;

describe("inviteOrganizationMemberAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    headersMock.mockResolvedValue(new Headers());
    requireActiveOrganizationRoleMock.mockResolvedValue({
      organizationId: "org_1",
      roles: ["owner"],
      primaryRole: "owner",
    });
    getCurrentOrganizationEntitlementsMock.mockResolvedValue(entitlements);
    listMembersMock.mockResolvedValue({
      members: [{ userId: "owner_1" }],
    });
    listInvitationsMock.mockResolvedValue([]);
    inviteOrganizationMemberMock.mockResolvedValue(undefined);
  });

  it("invites a member", async () => {
    const formData = new FormData();
    formData.set("email", "new@acme.com");
    formData.set("role", "member");

    const result = await inviteOrganizationMemberAction({}, formData);

    expect(requireActiveOrganizationRoleMock).toHaveBeenCalledWith(["owner"]);
    expect(assertCapabilityMock).toHaveBeenCalledWith(
      entitlements,
      "team.invite",
    );
    expect(assertLimitMock).toHaveBeenCalledWith(
      entitlements,
      "teamMembers",
      1,
    );
    expect(inviteOrganizationMemberMock).toHaveBeenCalledWith({
      organizationId: "org_1",
      email: "new@acme.com",
      role: "member",
    });
    expect(result).toEqual({
      success: "Invitation sent successfully",
      refreshKey: expect.any(Number),
    });
  });

  it("returns a friendly error when the member limit is reached", async () => {
    assertLimitMock.mockImplementation(() => {
      throw new LimitReachedError("teamMembers", 1, 1, "Pro");
    });

    const formData = new FormData();
    formData.set("email", "new@acme.com");
    formData.set("role", "member");

    const result = await inviteOrganizationMemberAction({}, formData);

    expect(inviteOrganizationMemberMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      error: 'Limit reached for "teamMembers": 1/1 (plan: Pro)',
    });
  });
});
