export type DataMode = "legacy" | "supabase";

const dataMode = (import.meta.env.VITE_DATA_MODE ?? "legacy").toLowerCase();

export function getDataMode(): DataMode {
  return dataMode === "supabase" ? "supabase" : "legacy";
}

export function isSupabaseDataEnabled() {
  return getDataMode() === "supabase";
}
