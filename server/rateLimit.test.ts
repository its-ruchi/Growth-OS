import { describe, expect, it } from "vitest";
import { checkRateLimit } from "./rateLimit";

describe("checkRateLimit", () => {
  it("allows requests within the limit and limits subsequent requests", () => {
    const key = "test_user_1";
    const windowMs = 5000;
    const maxRequests = 2;

    const res1 = checkRateLimit(key, windowMs, maxRequests);
    expect(res1.limited).toBe(false);
    expect(res1.remaining).toBe(1);

    const res2 = checkRateLimit(key, windowMs, maxRequests);
    expect(res2.limited).toBe(false);
    expect(res2.remaining).toBe(0);

    const res3 = checkRateLimit(key, windowMs, maxRequests);
    expect(res3.limited).toBe(true);
    expect(res3.remaining).toBe(0);
    expect(res3.retryAfter).toBeGreaterThan(0);
  });
});
