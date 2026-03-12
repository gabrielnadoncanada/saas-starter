export type TeamMemberView = {
  id: number;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  user: {
    id: number;
    name: string | null;
    email: string;
  };
};

export type TeamView = {
  id: number;
  planName: string | null;
  subscriptionStatus: string | null;
  teamMembers: TeamMemberView[];
};

export type PendingInvitationView = {
  id: number;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  invitedAt: string;
};
