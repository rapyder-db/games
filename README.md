# Rapyder Quiz + Live Leaderboard

Production-ready, free-tier friendly event quiz app built with Next.js App Router, TypeScript, Tailwind CSS, Supabase Postgres + Realtime, and Vercel.

## Features

- Event registration with name, company, and email
- Login-required arcade lobby and quiz flow
- 7-question quiz sampled randomly from 10 Rapyder GenAI/AWS questions
- Correct/wrong answer popups with explanation and 7-second auto-advance
- Server-side score validation and best-score-only persistence
- Live leaderboard (Top 50) powered by Supabase Realtime
- Hidden admin export for the configured admin identity
- Row Level Security and safe public leaderboard view
- Zod validation on inputs and submission payloads

## Stack

- Frontend: Next.js App Router + TypeScript
- Styling: Tailwind CSS
- Backend: Supabase Postgres + Realtime
- Hosting: Vercel

## Local setup

### 1. Create a Supabase project

Create a new project at https://supabase.com and wait for the database to finish provisioning.

### 2. Run the SQL schema

Open the Supabase SQL Editor and run `supabase/schema.sql`.

This creates:

- `public.players`
- `public.scores`
- indexes and uniqueness constraints
- `updated_at` triggers
- RLS policies
- `public.leaderboard_entries` view
- Realtime publication for `public.scores`

### 3. Add environment variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SECRET_KEY=your-server-secret-key
```

Notes:

- `NEXT_PUBLIC_*` values are safe for the browser
- `SUPABASE_SECRET_KEY` must stay server-only
- Never expose the server secret key in client components
- This app also accepts legacy names `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`

### 4. Install dependencies and run locally

On Windows PowerShell, use `npm.cmd` if script execution blocks `npm`.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deployment to Vercel

### 1. Push the repo to GitHub

Commit this repository and push it to GitHub.

### 2. Import into Vercel

- Create a new Vercel project
- Import the GitHub repository
- Framework preset: `Next.js`

### 3. Add environment variables in Vercel

In `Project Settings > Environment Variables`, add:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

Deploy the project.

## App flow

1. User registers on `/`
2. `/start` shows the arcade lobby and coin insertion experience
3. `/quiz` requires the event session cookie and redirects home if not logged in
4. Quiz runs 7 random questions, one at a time
5. Client sends answers to `POST /api/submit-score`
6. Server validates the session, computes score from question IDs, and saves only a better score
7. `/leaderboard` shows the Top 50 and refreshes live on inserts/updates
8. `/admin` is unlinked; only the configured admin identity can download the Excel-compatible export

## Security model

- Client does not write directly to `scores`
- `POST /api/submit-score` verifies the event session cookie server-side
- Score is computed on the server from submitted answers
- RLS is enabled on `players` and `scores`
- Public clients can read leaderboard-safe score data through the view
- Writes happen through server routes using the service role key
- Public leaderboard data is exposed via `leaderboard_entries` view without exposing player emails

## Project structure

```text
app/
  admin/page.tsx
  api/admin/export-users/route.ts
  api/submit-score/route.ts
  api/login/route.ts
  api/logout/route.ts
  api/generate-score-card/route.ts
  leaderboard/page.tsx
  quiz/page.tsx
  start/page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  auth-panel.tsx
  leaderboard-live.tsx
  quiz-experience.tsx
  site-header.tsx
lib/
  admin.ts
  env.ts
  leaderboard.ts
  quizQuestions.ts
  supabaseClient.ts
  supabaseServer.ts
  types.ts
  utils.ts
  validation.ts
supabase/
  schema.sql
```

## Notes on free tier friendliness

- Uses Supabase free tier services only
- Uses Vercel free tier hosting
- Quiz content is hardcoded, so no CMS or extra storage required
- Realtime subscription is limited to leaderboard refreshes for score events

## Recommended production follow-ups

- Add rate limiting on the API route using Vercel Edge Middleware or Upstash
- Add server-side audit logging for submissions
- Add weekly or seasonal leaderboard partitions via `quiz_version`
- Add test coverage for `submit-score` logic
