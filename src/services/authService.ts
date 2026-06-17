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
    options: { emailRedirectTo: window.location.origin },
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

let lastLoadedUpdatedAt: string | null = null;

/** Load workspace data for the currently logged-in user. */
export async function loadUserWorkspace(): Promise<any | null> {
  const session = await getCurrentUser();
  if (!session) return null;

  const { data, error } = await supabase
    .from("workspaces")
    .select("workspace, updated_at")
    .eq("user_id", session.userId)
    .maybeSingle();

  if (error) {
    console.warn("Failed to load workspace", error.message);
    return null;
  }

  if (data) {
    lastLoadedUpdatedAt = (data as any).updated_at ?? null;
    return (data as any).workspace ?? null;
  }
  return null;
}

/** Upsert workspace data for the currently logged-in user. */
export async function saveUserWorkspace(workspace: any): Promise<void> {
  const session = await getCurrentUser();
  if (!session) return;

  // 1. Enforce client-side size check (500KB limit)
  const serialized = JSON.stringify(workspace);
  if (serialized.length > 500000) {
    console.warn("Workspace size exceeds the 500KB limit. Save aborted.");
    // Warn the user via alert if in browser environment
    if (typeof window !== "undefined") {
      alert("Error: Your workspace is too large (exceeds the 500KB limit). Please delete old draft posts or history to make it smaller.");
    }
    return;
  }

  // 2. Collision detection: check if database has a newer update
  try {
    const { data: checkData } = await supabase
      .from("workspaces")
      .select("updated_at")
      .eq("user_id", session.userId)
      .maybeSingle();

    const dbUpdatedAt = checkData?.updated_at;
    if (dbUpdatedAt && lastLoadedUpdatedAt && dbUpdatedAt !== lastLoadedUpdatedAt) {
      if (typeof window !== "undefined") {
        const overwrite = confirm(
          "Warning: Your workspace has been updated on another device or tab since you loaded it.\n\n" +
          "Do you want to overwrite those changes? (Click Cancel to reload and fetch the latest changes)."
        );
        if (!overwrite) {
          window.location.reload();
          return;
        }
      }
    }
  } catch (checkError) {
    console.warn("Failed to perform collision check", checkError);
  }

  const row: WorkspaceRow = {
    user_id: session.userId,
    workspace,
  };

  const { data: upsertData, error } = await supabase
    .from("workspaces")
    .upsert(row, { onConflict: "user_id" })
    .select("updated_at")
    .maybeSingle();

  if (error) {
    console.warn("Failed to save workspace", error.message);
  } else if (upsertData?.updated_at) {
    lastLoadedUpdatedAt = upsertData.updated_at;
  }
}

