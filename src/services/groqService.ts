/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AgentId, AgentResponse } from "../types";
import { supabase } from "./supabaseClient";

// Frontend API client for our backend agents endpoint.
// Named "Groq" to reflect the current backend provider, but it only does HTTP.
export class GroqService {
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  }

  async runAgent<T>(agentId: AgentId, payload: any): Promise<AgentResponse<T>> {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 60_000);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      const response = await fetch(`${this.apiBaseUrl}/api/v1/agents/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ agentId, payload }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Request failed with status ${response.status}`);
      }

      return (await response.json()) as AgentResponse<T>;
    } catch (error) {
      console.error(`Error running agent ${agentId}:`, error);
      return {
        ok: false,
        agent: agentId,
        version: "v0.1",
        telemetry: [],
        data: {} as T,
        warnings: [],
        next_actions: [],
        error: {
          code: "AGENT_ERROR",
          message: error instanceof Error ? error.message : "Unknown error occurred",
        },
      };
    } finally {
      window.clearTimeout(timeout);
    }
  }
}

export const groqService = new GroqService();
