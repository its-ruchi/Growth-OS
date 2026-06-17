import express, { type NextFunction, type Request, type Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { config } from "./config.js";
import { checkRateLimit, getClientIp } from "./rateLimit.js";
import { isAgentId, sanitizePayload } from "./security.js";
import { SHARED_SYSTEM_PROMPT, AGENT_PROMPTS } from "./agentPrompts.js";
import { callGroqAgent } from "./groqService.js";
import { getUserFromBearer } from "./supabaseAuth.js";

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: config.requestBodyLimit }));
app.use((_, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.get('/api/v1/health', (_req, res) => {
  res.json({ ok: true, status: 'healthy' });
});

app.post('/api/v1/auth/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!config.supabaseServiceRoleKey) {
      return res.status(501).json({
        ok: false,
        error: { code: 'NOT_CONFIGURED', message: 'SUPABASE_SERVICE_ROLE_KEY is not set on the server.' },
      });
    }

    const { email, password } = req.body as { email?: unknown; password?: unknown };

    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ ok: false, error: { code: 'INVALID_EMAIL', message: 'Please enter a valid email address.' } });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ ok: false, error: { code: 'INVALID_PASSWORD', message: 'Password must be at least 6 characters.' } });
    }

    const adminClient = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await adminClient.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
    });

    if (!error) {
      return res.json({ ok: true, userId: data.user?.id });
    }

    // User exists but may be unconfirmed — find them and confirm + update password.
    if (error.message.toLowerCase().includes('already')) {
      const { data: listData } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
      const existing = listData?.users?.find(u => u.email === normalizedEmail);

      if (existing) {
        const { error: updateError } = await adminClient.auth.admin.updateUserById(existing.id, {
          password,
          email_confirm: true,
        });
        if (!updateError) {
          return res.json({ ok: true, userId: existing.id });
        }
        return res.status(400).json({ ok: false, error: { code: 'SIGNUP_ERROR', message: updateError.message } });
      }
    }

    return res.status(400).json({ ok: false, error: { code: 'SIGNUP_ERROR', message: error.message } });
  } catch (err) {
    return next(err);
  }
});

app.post('/api/v1/agents/run', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientIp = getClientIp(req);
    const ipLimitResult = checkRateLimit(`ip:${clientIp}`, config.ipRateLimitWindowMs, config.ipRateLimitMaxRequests);

    if (ipLimitResult.limited) {
      res.setHeader('Retry-After', String(ipLimitResult.retryAfter));
      res.setHeader('X-RateLimit-Limit', String(config.ipRateLimitMaxRequests));
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', String(ipLimitResult.resetAt));
      return res.status(429).json({
        ok: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests from this IP. Please wait before trying again.',
        },
      });
    }

    let user: any = null;

    if (config.requireAuth) {
      user = await getUserFromBearer(req.headers.authorization);
      if (!user) {
        return res.status(401).json({
          ok: false,
          error: { code: 'UNAUTHENTICATED', message: 'Missing or invalid access token.' },
        });
      }

      const userLimitResult = checkRateLimit(`user:${user.id}`, config.rateLimitWindowMs, config.rateLimitMaxRequests);
      
      res.setHeader('X-RateLimit-Limit', String(config.rateLimitMaxRequests));
      res.setHeader('X-RateLimit-Remaining', String(userLimitResult.remaining));
      res.setHeader('X-RateLimit-Reset', String(userLimitResult.resetAt));

      if (userLimitResult.limited) {
        res.setHeader('Retry-After', String(userLimitResult.retryAfter));
        return res.status(429).json({
          ok: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests for this account. Please wait before trying again.',
          },
        });
      }
    } else {
      res.setHeader('X-RateLimit-Limit', String(config.ipRateLimitMaxRequests));
      res.setHeader('X-RateLimit-Remaining', String(ipLimitResult.remaining));
      res.setHeader('X-RateLimit-Reset', String(ipLimitResult.resetAt));
    }


    const body = req.body as { agentId?: unknown; payload?: unknown };

    if (!isAgentId(body?.agentId)) {
      return res.status(400).json({
        ok: false,
        error: {
          code: 'INVALID_AGENT',
          message: 'agentId is missing or invalid.',
        },
      });
    }

    if (body.payload === undefined) {
      return res.status(400).json({
        ok: false,
        error: {
          code: 'INVALID_PAYLOAD',
          message: 'payload is required.',
        },
      });
    }

    // Only accept JSON objects at the API boundary; this keeps agent inputs predictable.
    if (typeof body.payload !== 'object' || body.payload === null || Array.isArray(body.payload)) {
      return res.status(400).json({
        ok: false,
        error: {
          code: 'INVALID_PAYLOAD',
          message: 'payload must be a JSON object.',
        },
      });
    }

    const safePayload = sanitizePayload(body.payload) as Record<string, unknown>;

    const agentPrompt = AGENT_PROMPTS[body.agentId];
    if (!agentPrompt) {
      return res.status(500).json({
        ok: false,
        error: {
          code: 'NO_PROMPT',
          message: `No prompt found for agent: ${body.agentId}`,
        },
      });
    }

    const systemPrompt = `${SHARED_SYSTEM_PROMPT}\n${agentPrompt}`;
    const result = await callGroqAgent(body.agentId, systemPrompt, safePayload);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = error instanceof Error ? error.message : 'Unexpected server error';
  res.status(500).json({
    ok: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
    },
  });
});

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on http://localhost:${config.port}`);
});
