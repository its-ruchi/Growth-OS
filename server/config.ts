import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const groqApiKey = process.env.GROQ_API_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!groqApiKey) {
  throw new Error(
    'Missing GROQ_API_KEY. Add it to your .env.local or environment variables.'
  );
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_ANON_KEY. Add them to your .env.local or environment variables.'
  );
}

export const config = {
  port: parseNumber(process.env.API_PORT, 8787),
  groqApiKey,
  supabaseUrl,
  supabaseAnonKey,
  requireAuth: (process.env.REQUIRE_AUTH || 'true').toLowerCase() === 'true',
  rateLimitWindowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
  rateLimitMaxRequests: parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 30),
  ipRateLimitWindowMs: parseNumber(process.env.IP_RATE_LIMIT_WINDOW_MS, 60_000),
  ipRateLimitMaxRequests: parseNumber(process.env.IP_RATE_LIMIT_MAX_REQUESTS, 60),
  requestBodyLimit: process.env.REQUEST_BODY_LIMIT || '250kb',
};

