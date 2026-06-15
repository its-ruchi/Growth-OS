import { config } from "../../../server/config.js";
import { isAgentId, sanitizePayload } from "../../../server/security.js";
import { SHARED_SYSTEM_PROMPT, AGENT_PROMPTS } from "../../../server/agentPrompts.js";
import { callGroqAgent } from "../../../server/groqService.js";
import { getUserFromBearer } from "../../../server/supabaseAuth.js";
import { checkRateLimit, getClientIp } from "../../../server/rateLimit.js";

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

  try {
    let rateLimitKey = getClientIp(req);
    let user: any = null;

    if (config.requireAuth) {
      user = await getUserFromBearer(req.headers?.authorization);
      if (!user) {
        return res.status(401).json({
          ok: false,
          error: { code: "UNAUTHENTICATED", message: "Missing or invalid access token." },
        });
      }
      rateLimitKey = `user:${user.id}`;
    }

    const limitResult = checkRateLimit(rateLimitKey, config.rateLimitWindowMs, config.rateLimitMaxRequests);

    // Set standard rate limiting headers
    res.setHeader("X-RateLimit-Limit", String(config.rateLimitMaxRequests));
    res.setHeader("X-RateLimit-Remaining", String(limitResult.remaining));
    res.setHeader("X-RateLimit-Reset", String(limitResult.resetAt));

    if (limitResult.limited) {
      res.setHeader("Retry-After", String(limitResult.retryAfter));
      return res.status(429).json({
        ok: false,
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests. Please wait before trying again.",
        },
      });
    }

    const body = (req.body || {}) as { agentId?: unknown; payload?: unknown };

    if (!isAgentId(body?.agentId)) {
      return res.status(400).json({
        ok: false,
        error: { code: "INVALID_AGENT", message: "agentId is missing or invalid." },
      });
    }

    if (body.payload === undefined) {
      return res.status(400).json({
        ok: false,
        error: { code: "INVALID_PAYLOAD", message: "payload is required." },
      });
    }

    if (typeof body.payload !== "object" || body.payload === null || Array.isArray(body.payload)) {
      return res.status(400).json({
        ok: false,
        error: { code: "INVALID_PAYLOAD", message: "payload must be a JSON object." },
      });
    }

    const safePayload = sanitizePayload(body.payload) as Record<string, unknown>;

    const agentPrompt = AGENT_PROMPTS[body.agentId];
    if (!agentPrompt) {
      return res.status(500).json({
        ok: false,
        error: { code: "NO_PROMPT", message: `No prompt found for agent: ${body.agentId}` },
      });
    }

    const systemPrompt = `${SHARED_SYSTEM_PROMPT}\n${agentPrompt}`;
    const result = await callGroqAgent(body.agentId, systemPrompt, safePayload);
    return res.status(200).json(result);
  } catch (error: any) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return res.status(500).json({
      ok: false,
      error: { code: "INTERNAL_ERROR", message },
    });
  }
}
