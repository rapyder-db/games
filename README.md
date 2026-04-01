# Rapyder Quiz + Live Leaderboard

Production-ready, free-tier friendly quiz app built with Next.js App Router, TypeScript, Tailwind CSS, Supabase (Postgres + Auth + Realtime), and Vercel.

## Features

- Supabase Auth with magic link and optional Google OAuth
- Login-required quiz flow
- 10 hardcoded Rapyder/cloud MCQs
- Server-side score validation and best-score-only persistence
- Live leaderboard (Top 50) powered by Supabase Realtime
- Row Level Security and safe public leaderboard view
- Zod validation on inputs and submission payloads

## Stack

- Frontend: Next.js App Router + TypeScript
- Styling: Tailwind CSS
- Backend: Supabase Postgres + Auth + Realtime
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
- `updated_at` and auth-email sync triggers
- RLS policies
- `public.leaderboard_entries` view
- Realtime publication for `public.scores`

### 3. Configure Auth

In Supabase:

- Go to `Authentication > URL Configuration`
- Set `Site URL` to `http://localhost:3000`
- Add redirect URL `http://localhost:3000/auth/callback`
- After deployment, also add:
  - `https://YOUR_VERCEL_DOMAIN/auth/callback`
  - `https://YOUR_CUSTOM_DOMAIN/auth/callback` if you use one

For Magic Link:

- `Authentication > Providers > Email`
- Enable Email provider and Magic Link flow

For Google OAuth (optional):

- Create OAuth credentials in Google Cloud
- In Supabase `Authentication > Providers > Google`, enable Google and add client ID/secret
- Use the Supabase callback URL shown in that screen

### 4. Add environment variables

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

### 5. Install dependencies and run locally

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

### 4. Update Supabase redirect URLs

After the first Vercel deploy:

- Add `https://YOUR_PROJECT.vercel.app/auth/callback`
- If using a custom domain, add that callback URL too
- Update `Site URL` if you want email links to point to production by default

## App flow

1. User signs in on `/`
2. `/quiz` requires auth and redirects home if not logged in
3. Player profile collects `name` and `companyName`
4. Quiz runs 10 questions, one at a time
5. Client sends answers to `POST /api/submit-score`
6. Server validates session, computes score, upserts player, and saves only a better score
7. `/leaderboard` shows the Top 50 and refreshes live on inserts/updates

## Security model

- Client does not write directly to `scores`
- `POST /api/submit-score` verifies the Supabase session server-side
- Score is computed on the server from submitted answers
- RLS is enabled on `players` and `scores`
- `players` rows are readable/updatable only by their owner
- `scores` are readable by authenticated users
- Public leaderboard data is exposed via `leaderboard_entries` view without exposing player emails

## Project structure

```text
app/
  api/submit-score/route.ts
  auth/callback/route.ts
  leaderboard/page.tsx
  quiz/page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  auth-panel.tsx
  leaderboard-live.tsx
  quiz-experience.tsx
  site-header.tsx
lib/
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
