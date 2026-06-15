type Entry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Entry>();

export const getClientIp = (req: any): string => {
  const xff = req.headers?.['x-forwarded-for'];
  if (typeof xff === 'string') {
    return xff.split(',')[0].trim();
  }
  if (Array.isArray(xff) && xff.length > 0) {
    return xff[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
};

export type RateLimitResult = {
  limited: boolean;
  remaining: number;
  resetAt: number;
  retryAfter: number;
};

export const checkRateLimit = (
  key: string,
  windowMs: number,
  maxRequests: number
): RateLimitResult => {
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      limited: false,
      remaining: maxRequests - 1,
      resetAt,
      retryAfter: 0,
    };
  }

  if (current.count >= maxRequests) {
    const retryAfter = Math.ceil((current.resetAt - now) / 1_000);
    return {
      limited: true,
      remaining: 0,
      resetAt: current.resetAt,
      retryAfter: Math.max(retryAfter, 1),
    };
  }

  current.count += 1;
  store.set(key, current);
  return {
    limited: false,
    remaining: maxRequests - current.count,
    resetAt: current.resetAt,
    retryAfter: 0,
  };
};

