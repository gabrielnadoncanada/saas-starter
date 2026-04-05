export type OrgMember = {
  id: string;
  role: string;
  userId: string;
  createdAt: Date;
  user: { email: string; name: string | null; image?: string | null };
};

export type AdminOrganization = {
  id: string;
  name: string;
  slug: string | null;
  createdAt: Date;
  stripeCustomerId: string | null;
  members: OrgMember[];
  _count: { members: number };
};

export type OrgSubscription = {
  id: string;
  plan: string;
  status: string;
  periodEnd: Date | null;
} | null;

export type ListAdminOrganizationsQuery = {
  limit?: number;
  offset?: number;
  search?: string;
};
