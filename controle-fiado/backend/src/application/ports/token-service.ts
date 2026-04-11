export type TokenPayload = {
  sub: string;
  login: string;
  role: "OWNER" | "STAFF";
};

export interface TokenService {
  sign(payload: TokenPayload): Promise<string>;
  verify(token: string): Promise<TokenPayload>;
}
