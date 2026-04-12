import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../../shared/supabase/client";
import type { AuthUser } from "../types/auth";

type ProfileRow = {
  id: string;
  name: string;
  role: "OWNER" | "STAFF";
  is_active: boolean;
};

export async function signInWithSupabase(input: { email: string; password: string }) {
  ensureSupabase();

  const { error } = await supabase!.auth.signInWithPassword({
    email: input.email,
    password: input.password
  });

  if (error) {
    throw new Error(error.message || "Falha ao autenticar no Supabase.");
  }
}

export async function signOutFromSupabase() {
  ensureSupabase();
  const { error } = await supabase!.auth.signOut();

  if (error) {
    throw new Error(error.message || "Falha ao encerrar sessao.");
  }
}

export async function getSupabaseSession() {
  ensureSupabase();
  const { data, error } = await supabase!.auth.getSession();

  if (error) {
    throw new Error(error.message || "Falha ao carregar sessao do Supabase.");
  }

  return data.session;
}

export async function fetchSupabaseProfile(session: Session): Promise<AuthUser> {
  ensureSupabase();

  const { data, error } = await supabase!
    .from("profiles")
    .select("id, name, role, is_active")
    .eq("auth_user_id", session.user.id)
    .maybeSingle<ProfileRow>();

  if (error) {
    throw new Error(error.message || "Falha ao carregar perfil do usuario.");
  }

  if (!data) {
    throw new Error("Usuario autenticado sem profile no sistema.");
  }

  if (!data.is_active) {
    throw new Error("Usuario desativado no sistema.");
  }

  return {
    id: data.id,
    authUserId: session.user.id,
    name: data.name,
    login: session.user.email ?? "",
    role: data.role,
    authMode: "supabase"
  };
}

export function subscribeToSupabaseAuthChanges(listener: () => void) {
  ensureSupabase();
  const subscription = supabase!.auth.onAuthStateChange(() => {
    listener();
  });

  return () => {
    subscription.data.subscription.unsubscribe();
  };
}

function ensureSupabase() {
  if (!supabase) {
    throw new Error("Supabase nao configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
  }
}
