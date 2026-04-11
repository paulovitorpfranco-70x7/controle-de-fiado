export type AuthUser = {
  id: string;
  name: string;
  login: string;
  role: "OWNER" | "STAFF";
  passwordHash: string;
};

export interface UserRepository {
  findByLogin(login: string): Promise<AuthUser | null>;
  findById(id: string): Promise<Omit<AuthUser, "passwordHash"> | null>;
}
