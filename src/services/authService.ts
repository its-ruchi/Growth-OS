/**
 * Supabase-backed authentication + workspace persistence.
 * Replaces the previous localStorage demo auth.
 */

import { supabase } from "./supabaseClient";

export interface AuthSession {
  email: string;
  userId: string;
  accessToken: string;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
  info?: string;
  email?: string;
}

type WorkspaceRow = {
  user_id: string;
  workspace: any;
  updated_at?: string;
};

export async function signUp(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
  });

  if (error) return { ok: false, error: error.message };
  // If email confirmations are enabled in Supabase, session may be null until verified.
  if (!data.session) {
    return {
      ok: false,
      info: "Check your email to confirm your account, then log in.",
    };
  }

  const userEmail = data.user?.email || normalizedEmail;
  return { ok: true, email: userEmail };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (!password) {
    return { ok: false, error: "Please enter your password." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) return { ok: false, error: error.message };
  const userEmail = data.user?.email || normalizedEmail;
  return { ok: true, email: userEmail };
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<AuthSession | null> {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session?.user?.id || !session.access_token || !session.user.email) return null;
  return {
    email: session.user.email,
    userId: session.user.id,
    accessToken: session.access_token,
  };
}

/** Load workspace data for the currently logged-in user. */
export async function loadUserWorkspace(): Promise<any | null> {
  const session = await getCurrentUser();
  if (!session) return null;

  const { data, error } = await supabase
    .from("workspaces")
    .select("workspace")
    .eq("user_id", session.userId)
    .maybeSingle();

  if (error) {
    console.warn("Failed to load workspace", error.message);
    return null;
  }

  return (data as any)?.workspace ?? null;
}

/** Upsert workspace data for the currently logged-in user. */
export async function saveUserWorkspace(workspace: any): Promise<void> {
  const session = await getCurrentUser();
  if (!session) return;

  const row: WorkspaceRow = {
    user_id: session.userId,
    workspace,
  };

  const { error } = await supabase
    .from("workspaces")
    .upsert(row, { onConflict: "user_id" });

  if (error) {
    console.warn("Failed to save workspace", error.message);
  }
}
