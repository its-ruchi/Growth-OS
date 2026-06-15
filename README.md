# LinkedIn Growth OS

Elite LinkedIn ghostwriting and content strategy system that generates algorithm-optimized posts using 2026 LinkedIn rules.

## Features

- **Voice Analysis**: Analyzes writing samples to extract unique voice fingerprint
- **Algorithm Optimization**: Applies 2026 LinkedIn algorithm rules for maximum reach
- **Multiple Formats**: Generates text, carousel, story, and insight posts
- **Style Adaptation**: 6 content styles (Storyteller, Educator, Contrarian, Data-driven, Tactical, Transparent)
- **Performance Prediction**: Analyzes why posts will perform based on engagement factors

## Architecture

This app runs as a full-stack project:
- React + Vite frontend
- Express backend (`/api/v1/...`) for secure AI agent invocations

## Quick Start

**Prerequisites:** Node.js 20+

### Installation & Run
1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set:
   - `GROQ_API_KEY`
   - `SUPABASE_URL`, `SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
3. Start the application:
   `npm run dev`
4. Open: `http://localhost:3000`

## Security Baseline

- Groq API key is server-side only (not exposed in browser bundles).
- Supabase anon key is safe to expose in the browser; RLS policies protect data.
- AI endpoint is versioned at `/api/v1/agents/run`.
- Input is sanitized server-side before model invocation.
- AI endpoint has IP-based rate limiting to reduce abuse/billing spikes.

## Supabase Setup

1. Create a Supabase project.
2. In the SQL Editor, run the schema in `supabase/schema.sql`.
3. Enable Email/Password auth in Supabase Auth settings (if disabled).

## Vercel Deployment

Deploy the Vite app to Vercel, and set the same env vars in Vercel Project Settings:
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and `GROQ_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.

## 2026 LinkedIn Algorithm Rules

The system follows these non-negotiable rules:

**What Works Now:**
- Document/carousel posts get 6.6% engagement (highest format)
- Text posts with strong opinions get shared and saved
- Niche-specific content beats broad advice
- Comments in first 60 mins get 10x more reach
- SAVES are the #1 signal LinkedIn weights
- Content lifespan is 2-3 weeks with early engagement
- Commenting before posting boosts reach 3-5x

**What Kills Reach:**
- External links in post body (put in first comment)
- Generic AI-sounding language
- Engagement bait ("comment YES if you agree")
- Posting and ghosting
- Broad advice not specific to niche
- More than 3 hashtags
