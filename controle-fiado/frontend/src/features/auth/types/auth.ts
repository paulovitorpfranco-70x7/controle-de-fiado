export type AuthUser = {
  id: string;
  name: string;
  login: string;
  role: "OWNER" | "STAFF";
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
  expiresAt?: string;
};
