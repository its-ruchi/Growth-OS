import express, { type NextFunction, type Request, type Response } from "express";
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

app.post('/api/v1/agents/run', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let rateLimitKey = getClientIp(req);
    let user: any = null;

    if (config.requireAuth) {
      user = await getUserFromBearer(req.headers.authorization);
      if (!user) {
        return res.status(401).json({
          ok: false,
          error: { code: 'UNAUTHENTICATED', message: 'Missing or invalid access token.' },
        });
      }
      rateLimitKey = `user:${user.id}`;
    }

    const limitResult = checkRateLimit(rateLimitKey, config.rateLimitWindowMs, config.rateLimitMaxRequests);
    
    // Set standard rate limiting headers
    res.setHeader('X-RateLimit-Limit', String(config.rateLimitMaxRequests));
    res.setHeader('X-RateLimit-Remaining', String(limitResult.remaining));
    res.setHeader('X-RateLimit-Reset', String(limitResult.resetAt));

    if (limitResult.limited) {
      res.setHeader('Retry-After', String(limitResult.retryAfter));
      return res.status(429).json({
        ok: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please wait before trying again.',
        },
      });
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
