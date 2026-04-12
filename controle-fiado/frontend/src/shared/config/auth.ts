export type AuthMode = "legacy" | "supabase";

const authMode = (import.meta.env.VITE_AUTH_MODE ?? "legacy").toLowerCase();

export function getAuthMode(): AuthMode {
  return authMode === "supabase" ? "supabase" : "legacy";
}

export function isSupabaseAuthEnabled() {
  return getAuthMode() === "supabase";
}
