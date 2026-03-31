/**
 * User-facing terminology for the "team" concept.
 *
 * Change these values to rebrand "Team" to "Workspace", "Organization",
 * "Company", or anything else. All UI labels that reference this concept
 * import from here — a single edit propagates everywhere.
 */
export const terminology = {
  /** Singular lowercase: "team", "workspace", "organization" */
  singular: "team",

  /** Plural lowercase: "teams", "workspaces", "organizations" */
  plural: "teams",

  /** Singular capitalized: "Team", "Workspace", "Organization" */
  Singular: "Team",

  /** Plural capitalized: "Teams", "Workspaces", "Organizations" */
  Plural: "Teams",
} as const;
