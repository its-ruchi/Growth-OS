import { createClient } from "@supabase/supabase-js";
import { config } from "./config.js";

// Server-side client used only for token verification via auth.getUser(token).
// Uses anon key + user JWT; do NOT use service role key in the browser.
const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

export const getUserFromBearer = async (authHeader: string | undefined) => {
  if (!authHeader) return null;
  const m = authHeader.match(/^Bearer\s+(.+)$/i);
  const token = m?.[1]?.trim();
  if (!token) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error) return null;
  return data.user ?? null;
};
