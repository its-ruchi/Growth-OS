import { createClient } from "@supabase/supabase-js";
import { config } from "../../../server/config.js";

export default async function handler(req: any, res: any) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      ok: false,
      error: { code: "METHOD_NOT_ALLOWED", message: "Use POST." },
    });
  }

  if (!config.supabaseServiceRoleKey) {
    return res.status(501).json({
      ok: false,
      error: {
        code: "NOT_CONFIGURED",
        message: "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your Vercel environment variables.",
      },
    });
  }

  const { email, password } = (req.body || {}) as { email?: unknown; password?: unknown };

  if (typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({
      ok: false,
      error: { code: "INVALID_EMAIL", message: "Please enter a valid email address." },
    });
  }
  if (typeof password !== "string" || password.length < 6) {
    return res.status(400).json({
      ok: false,
      error: { code: "INVALID_PASSWORD", message: "Password must be at least 6 characters." },
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const adminClient = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await adminClient.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true,
  });

  if (!error) {
    return res.status(200).json({ ok: true, userId: data.user?.id });
  }

  // User exists but may be unconfirmed — find and confirm them, update password.
  if (error.message.toLowerCase().includes("already")) {
    let page = 1;
    let found: { id: string; email?: string } | null = null;

    while (!found) {
      const { data: listData, error: listError } = await adminClient.auth.admin.listUsers({
        page,
        perPage: 1000,
      });
      if (listError || !listData?.users?.length) break;

      found = listData.users.find((u) => u.email === normalizedEmail) ?? null;

      if (found || listData.users.length < 1000) break;
      page++;
    }

    if (found) {
      const { error: updateError } = await adminClient.auth.admin.updateUserById(found.id, {
        password,
        email_confirm: true,
      });
      if (!updateError) {
        return res.status(200).json({ ok: true, userId: found.id });
      }
      return res.status(400).json({
        ok: false,
        error: { code: "SIGNUP_ERROR", message: updateError.message },
      });
    }
  }

  return res.status(400).json({
    ok: false,
    error: { code: "SIGNUP_ERROR", message: error.message },
  });
}
