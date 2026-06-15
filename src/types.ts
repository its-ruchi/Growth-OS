/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AgentId = 
  | 'onboarding' 
  | 'weekly_strategy' 
  | 'post_drafter' 
  | 'post_refiner' 
  | 'publish_pack' 
  | 'engagement_queue' 
  | 'lead_creator' 
  | 'dm_assistant' 
  | 'reporting';

export interface AgentResponse<T = any> {
  ok: boolean;
  agent: AgentId;
  version: string;
  telemetry: { event: string; props: Record<string, any> }[];
  data: T;
  warnings: { code: string; message: string }[];
  next_actions: { type: 'HUMAN_APPROVAL' | 'API_CALL' | 'STOP'; label: string; payload: any }[];
  error?: { code: string; message: string };
}

export interface Workspace {
  voice_card?: any;
  icp_profile?: any;
  offer_positioning?: any;
  content_angles?: string[];
  week_plan?: any[];
  // Optional: when weekly_strategy returns full drafts for the week.
  week_posts?: any[];
  writing_samples?: string[];
  current_post_draft?: any;
  post_history?: {
    id: string;
    createdAt: string;
    topic?: string;
    voice?: string;
    body: string;
    hook?: string;
    wordCount?: number;
  }[];
  leads?: any[];
  engagement_queue?: any[];
  reports?: any[];
  isLinkedinConnected?: boolean;
  settings?: {
    profile?: {
      fullName: string;
      role: string;
      bio: string;
      targetAudience: string[];
    };
    content?: {
      frequency: 'Daily' | 'Weekly';
      style: string[];
      tone: 'Professional' | 'Casual' | 'Bold';
      platforms: string[];
    };
    ai?: {
      autoGenerate: boolean;
      draftLength: 'Short' | 'Medium' | 'Long';
      creativity: number;
    };
    notifications?: {
      emailAlerts: boolean;
      weeklyReminder: boolean;
      leadAlerts: boolean;
    };
    billing?: {
      plan: 'Free' | 'Pro';
      usage: {
        postsGenerated: number;
        strategyRuns: number;
      };
    };
  };
}
