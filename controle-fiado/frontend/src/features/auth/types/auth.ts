export type AuthUser = {
  id: string;
  authUserId?: string;
  name: string;
  login: string;
  role: "OWNER" | "STAFF";
  authMode?: "legacy" | "supabase";
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
  expiresAt?: string;
};

export type LoginInput = {
  login: string;
  password: string;
};
