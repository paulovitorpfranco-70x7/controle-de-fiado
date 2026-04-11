export type TokenPayload = {
  sub: string;
  login: string;
  role: "OWNER" | "STAFF";
  iat?: number;
  exp?: number;
};

export interface TokenService {
  sign(payload: TokenPayload): Promise<string>;
  verify(token: string): Promise<TokenPayload>;
}
