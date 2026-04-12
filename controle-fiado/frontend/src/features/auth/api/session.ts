import { fetchMe } from "./fetch-me";
import { login as legacyLogin } from "./login";
import {
  fetchSupabaseProfile,
  getSupabaseSession,
  signInWithSupabase,
  signOutFromSupabase,
  subscribeToSupabaseAuthChanges
} from "./supabase-session";
import type { AuthUser, LoginInput } from "../types/auth";
import { getAuthMode, type AuthMode } from "../../../shared/config/auth";
import { setAuthToken } from "../../../shared/api/http";

export function getCurrentAuthMode(): AuthMode {
  return getAuthMode();
}

export async function restoreSession(): Promise<AuthUser | null> {
  if (getAuthMode() === "supabase") {
    const session = await getSupabaseSession();

    if (!session) {
      return null;
    }

    return fetchSupabaseProfile(session);
  }

  const storedToken = sessionStorage.getItem("controle-fiado-token");

  if (!storedToken) {
    return null;
  }

  setAuthToken(storedToken);
  return fetchMe();
}

export async function signIn(input: LoginInput): Promise<AuthUser> {
  if (getAuthMode() === "supabase") {
    await signInWithSupabase({
      email: input.login,
      password: input.password
    });

    const session = await getSupabaseSession();

    if (!session) {
      throw new Error("Sessao do Supabase nao encontrada apos o login.");
    }

    return fetchSupabaseProfile(session);
  }

  const result = await legacyLogin(input);
  setAuthToken(result.token);
  sessionStorage.setItem("controle-fiado-token", result.token);
  return fetchMe();
}

export async function signOut() {
  if (getAuthMode() === "supabase") {
    await signOutFromSupabase();
    return;
  }

  sessionStorage.removeItem("controle-fiado-token");
  setAuthToken("");
}

export function subscribeToAuthChanges(listener: () => void) {
  if (getAuthMode() !== "supabase") {
    return () => {};
  }

  return subscribeToSupabaseAuthChanges(listener);
}
