/**
 * Account mode configuration.
 *
 * Controls how users interact with the platform:
 * - "personal-only"      → B2C: single workspace per user, no teams/invitations
 * - "organizations-only" → B2B: always team-based, org switcher visible
 *
 * Regardless of mode, data is always scoped to an organization under the hood.
 * The mode only controls what UI is shown to the user.
 */

const VALID_MODES = ["personal-only", "organizations-only"] as const;
export type AccountMode = (typeof VALID_MODES)[number];

function resolveAccountMode(): AccountMode {
  const raw = process.env.NEXT_PUBLIC_ACCOUNT_MODE;
  if (raw && VALID_MODES.includes(raw as AccountMode)) {
    return raw as AccountMode;
  }
  return "organizations-only";
}

export const accountMode = resolveAccountMode();

/** Derived feature flags — all driven by the single account mode value. */
export const accountFlags = {
  /** Show team-related UI: members page, invitations, org settings. */
  enableTeamFeatures: accountMode !== "personal-only",

  /** Allow users to create additional organizations. */
  allowCreateOrganization: accountMode !== "personal-only",

  /** Show the workspace/org switcher in the sidebar. */
  showOrgSwitcher: accountMode !== "personal-only",

  /** Billing is attached to the organization (always true — org is the scope). */
  enableOrgBilling: true,

  /** The mode itself, for edge cases. */
  mode: accountMode,
} as const;
