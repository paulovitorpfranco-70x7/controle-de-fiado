import { httpPost } from "../../../shared/api/http";
import type { LoginResponse } from "../types/auth";

export function login(input: { login: string; password: string }) {
  return httpPost<LoginResponse>("/auth/login", input);
}
