export type AuthUserContext = {
  id: number;
  platformRole: string | null;
};

export type AuthJwtToken = {
  sub?: string;
  id?: string;
  platformRole?: string;
};
