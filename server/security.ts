import type { AgentId } from '../src/types';

const ALLOWED_AGENT_IDS: AgentId[] = [
  'onboarding',
  'weekly_strategy',
  'post_drafter',
  'post_refiner',
  'publish_pack',
  'engagement_queue',
  'lead_creator',
  'dm_assistant',
  'reporting',
];

const MAX_DEPTH = 8;
const MAX_ARRAY_LENGTH = 200;
const MAX_STRING_LENGTH = 8_000;

const stripControlChars = (input: string) =>
  input.replace(/[\u0000-\u001F\u007F]/g, '').trim();

const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

export const isAgentId = (value: unknown): value is AgentId =>
  typeof value === 'string' &&
  ALLOWED_AGENT_IDS.includes(value as AgentId);

export const sanitizePayload = (value: unknown, depth = 0): unknown => {
  if (depth > MAX_DEPTH) return null;

  if (
    value === null ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (typeof value === 'string') {
    const cleaned = stripControlChars(value);
    return cleaned.length > MAX_STRING_LENGTH
      ? cleaned.slice(0, MAX_STRING_LENGTH)
      : cleaned;
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_ARRAY_LENGTH)
      .map((item) => sanitizePayload(item, depth + 1));
  }

  if (typeof value === 'object') {
    const source = value as Record<string, unknown>;
    // Use a null-prototype object to avoid prototype pollution gadgets.
    const target: Record<string, unknown> = Object.create(null);
    for (const [key, nestedValue] of Object.entries(source)) {
      const safeKey = stripControlChars(key).slice(0, 120);
      if (!safeKey) continue;
      if (FORBIDDEN_KEYS.has(safeKey)) continue;
      target[safeKey] = sanitizePayload(nestedValue, depth + 1);
    }
    return target;
  }

  return null;
};
