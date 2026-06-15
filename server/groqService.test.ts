import { describe, expect, it, vi, beforeEach } from "vitest";

// Ensure config validation passes in tests without relying on a developer .env.local.
process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || "test_groq_key";
process.env.SUPABASE_URL = process.env.SUPABASE_URL || "http://localhost:54321";
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "test_anon_key";

// We capture calls to Groq's chat.completions.create.
const createMock = vi.fn();

vi.mock("groq-sdk", () => {
  class GroqMock {
    chat = {
      completions: {
        create: createMock,
      },
    };

    constructor(_opts: any) {
      // no-op
    }
  }

  return {
    default: GroqMock,
  };
});

describe("callGroqAgent", () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it('uses llama-3.3-70b-versatile for agentId "post_drafter"', async () => {
    const { callGroqAgent } = await import("./groqService");

    createMock.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify({ ok: true }) } }],
    });

    await callGroqAgent("post_drafter", "system", { a: 1 });

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock.mock.calls[0][0].model).toBe("llama-3.3-70b-versatile");
  });

  it('uses llama-3.1-8b-instant for agentId "onboarding"', async () => {
    const { callGroqAgent } = await import("./groqService");

    createMock.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify({ ok: true }) } }],
    });

    await callGroqAgent("onboarding", "system", { a: 1 });

    expect(createMock).toHaveBeenCalledTimes(1);
    expect(createMock.mock.calls[0][0].model).toBe("llama-3.1-8b-instant");
  });

  it("returns valid parsed JSON", async () => {
    const { callGroqAgent } = await import("./groqService");

    createMock.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify({ ok: true, n: 123 }) } }],
    });

    const result = await callGroqAgent("onboarding", "system", { a: 1 });
    expect(result).toEqual({ ok: true, n: 123 });
  });

  it("falls back to fast model on 429 and still returns parsed JSON", async () => {
    const { callGroqAgent } = await import("./groqService");

    createMock
      .mockRejectedValueOnce({ status: 429 })
      .mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ ok: true, fallback: true }) } }],
      });

    const result = await callGroqAgent("post_drafter", "system", { a: 1 });

    expect(createMock).toHaveBeenCalledTimes(2);
    expect(createMock.mock.calls[0][0].model).toBe("llama-3.3-70b-versatile");
    expect(createMock.mock.calls[1][0].model).toBe("llama-3.1-8b-instant");
    expect(result).toEqual({ ok: true, fallback: true });
  });
});
