import { httpGet } from "../../../shared/api/http";
import type { AuthUser } from "../types/auth";

export function fetchMe() {
  return httpGet<AuthUser>("/auth/me");
}
