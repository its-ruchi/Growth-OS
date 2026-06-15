import Groq from "groq-sdk"
import { config } from "./config.js"

const groq = new Groq({
  apiKey: config.groqApiKey
})

const MODELS = {
  quality: "llama-3.3-70b-versatile",
  fast: "llama-3.1-8b-instant"
} as const

const WRITING_AGENTS = new Set(["post_drafter", "post_refiner"])

const getModel = (agentId: string): string => {
  return WRITING_AGENTS.has(agentId) ? MODELS.quality : MODELS.fast
}

const parseJsonOrThrow = (raw: string): object => {
  try {
    return JSON.parse(raw) as object
  } catch {
    throw new Error("Invalid JSON response from Groq")
  }
}

const createOnce = async (
  model: string,
  temperature: number,
  systemPrompt: string,
  userPayload: object
) => {
  return groq.chat.completions.create({
    model,
    temperature,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(userPayload) }
    ]
  })
}

export const callGroqAgent = async (
  agentId: string,
  systemPrompt: string,
  userPayload: object
): Promise<object> => {
  const model = getModel(agentId)

  try {
    const response = await createOnce(
      model,
      agentId === "post_drafter" ? 0.8 : 0.4,
      systemPrompt,
      userPayload
    )

    const raw = response.choices[0].message.content
    if (!raw) throw new Error("Empty response from Groq")

    // response_format helps, but we still guard against rare invalid JSON.
    try {
      return parseJsonOrThrow(raw)
    } catch {
      const retry = await createOnce(
        model,
        0.2,
        systemPrompt + "\n\nIMPORTANT: Your previous response was not valid JSON. Return ONLY valid JSON.",
        userPayload
      )
      const retryRaw = retry.choices[0].message.content
      if (!retryRaw) throw new Error("Empty retry response from Groq")
      return parseJsonOrThrow(retryRaw)
    }
  } catch (error: any) {
    if (error?.status === 429) {
      console.warn(`Rate limit hit on ${model} - falling back to fast model`)

      const fallback = await createOnce(
        MODELS.fast,
        0.7,
        systemPrompt,
        userPayload
      )

      const raw = fallback.choices[0].message.content
      if (!raw) throw new Error("Empty fallback response")

      return parseJsonOrThrow(raw)
    }

    throw error
  }
}
