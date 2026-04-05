import { beforeEach, describe, expect, it, vi } from "vitest";

import { LimitReachedError } from "@/features/billing/errors/billing-errors";

const {
  headersMock,
  getCurrentOrganizationEntitlementsMock,
  assertCapabilityMock,
  assertLimitMock,
  inviteOrganizationMemberMock,
  listMembersMock,
  listInvitationsMock,
} = vi.hoisted(() => ({
  headersMock: vi.fn(),
  getCurrentOrganizationEntitlementsMock: vi.fn(),
  assertCapabilityMock: vi.fn(),
  assertLimitMock: vi.fn(),
  inviteOrganizationMemberMock: vi.fn(),
  listMembersMock: vi.fn(),
  listInvitationsMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

vi.mock("@/shared/lib/auth/authenticated-action", () => ({
  validatedAuthenticatedAction: vi.fn(),
}));

vi.mock(
  "@/features/organizations/actions/validated-organization-owner",
  () => ({
    validatedOrganizationOwnerAction: (_schema: unknown, action: unknown) =>
      action,
  }),
);

vi.mock("@/features/billing/server/organization-entitlements", () => ({
  getCurrentOrganizationEntitlements: getCurrentOrganizationEntitlementsMock,
}));

vi.mock("@/features/billing/guards/plan-guards", () => ({
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
  await import("@/features/organizations/actions/organization-owner.actions");

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
    getCurrentOrganizationEntitlementsMock.mockResolvedValue(entitlements);
    listMembersMock.mockResolvedValue({
      members: [{ userId: "owner_1" }],
    });
    listInvitationsMock.mockResolvedValue([]);
    inviteOrganizationMemberMock.mockResolvedValue(undefined);
  });

  it("invites a member", async () => {
    const result = await inviteOrganizationMemberAction(
      { email: "new@acme.com", role: "member" },
      new FormData(),
      { organizationId: "org_1", user: { id: "owner_1" } },
    );

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

    const result = await inviteOrganizationMemberAction(
      { email: "new@acme.com", role: "member" },
      new FormData(),
      { organizationId: "org_1", user: { id: "owner_1" } },
    );

    expect(inviteOrganizationMemberMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      error: 'Limit reached for "teamMembers": 1/1 (plan: Pro)',
    });
  });
});
