# Rapyder Arcade Game - Builder Reference

Last reviewed: 2026-05-12

This file is the one-file handoff for builders who need to understand the current game without rereading every source file. It describes what is actually implemented in the repository now, not only what the older README says.

## One-Sentence Summary

Rapyder Arcade is a branded lead-capture quiz game built with Next.js, Tailwind CSS, Supabase Postgres, and Supabase Realtime: a player enters identity details, inserts a virtual coin, answers a randomized 10-question Rapyder/cloud quiz, saves their best score, unlocks a reward state, generates a share card, and appears on a live leaderboard.

## Current Product Shape

The app is a campaign/event microsite, not a full user-account product.

The user journey is:

1. Visitor lands on `/`.
2. Visitor enters name, company, and email.
3. `POST /api/login` inserts a new `players` row and sets an HTTP-only `game_session_id` cookie.
4. Home page detects the cookie and shows the arcade lobby.
5. Player clicks `Insert Coin`.
6. Lobby plays a short animated/audio countdown, then routes to `/quiz`.
7. Quiz presents 10 randomized questions from a 12-question pool.
8. User saves the result.
9. Server recomputes the score from canonical answers and stores only the best score for the current quiz version.
10. Reward screen generates a score card and offers share/download/copy actions.
11. Leaderboard shows the top 50 scores and updates through Supabase Realtime.

## Important Source-of-Truth Warning

`README.md` is stale in several important areas. It describes Supabase Auth, magic links, Google OAuth, an auth callback route, and ownership-based RLS. The current code does not use that model.

The actual app currently uses:

- A custom cookie session named `game_session_id`
- Direct `players` insertion on login
- No email verification
- No password
- No Supabase Auth session in the gameplay flow
- Server-side Supabase service-role access for reads/writes
- A public leaderboard view for browser reads

Treat the source code and this file as current. Treat the README as partially historical until it is updated.

## Stack

- Framework: Next.js App Router 15
- Runtime language: TypeScript, React 19
- Styling: Tailwind CSS plus a large custom `app/globals.css`
- Database/backend: Supabase Postgres
- Realtime: Supabase Realtime subscription on `public.scores`
- Validation: Zod
- Toasts: Sonner
- 3D libraries installed: Three.js, `@react-three/fiber`, `@react-three/drei`
- Hosting target: Vercel
- Reward-card script stack: Python, Pillow, PyMuPDF/Fitz

## Key Constants And Rules

- Current quiz version: `v2`
- Question bank size: 12
- Questions per game: 10
- Scoring: 10 points per correct answer, saved score range is effectively 0 to 100
- Reward unlock: `bestScore >= 70`
- Leaderboard size: top 50
- Leaderboard sort: higher score first, earlier `updated_at` wins ties
- Session cookie: `game_session_id`
- Session cookie lifetime: 30 days
- Score persistence: one score row per player per quiz version is intended by app logic, but not enforced by a database uniqueness constraint
- Login identity policy: every login inserts a new player row, even for the same email

## Runtime Flow

### 1. Root Layout

`app/layout.tsx` wraps all pages with:

- DM Sans from `next/font/google`
- Global CSS
- A persistent `SiteHeader`
- A dark arcade background made from CSS radial gradients and grid layers
- A Sonner toaster

Metadata is generic: title `Rapyder Quiz + Live Leaderboard`, description `A Cloud-powered quiz game with live leaderboard updates.`

### 2. Home Page

`app/page.tsx` is dynamic. It calls `getPlayerSession()` and, if a player id exists, fetches that player using the Supabase admin client.

If a valid player exists:

- It renders `ArcadeLobby`.

If not:

- It renders a two-column login/reward preview layout.
- Left side is a branded welcome panel with `Smartwatch 3d.mp4`.
- Right side is `AuthPanel`.

### 3. Login

`components/auth-panel.tsx` collects:

- `name`
- `companyName`
- `email`

It posts those values to `POST /api/login`.

`app/api/login/route.ts`:

- Extends `profileSchema` with an email field.
- Validates the payload with Zod.
- Inserts a new row into `public.players`.
- Sets the `game_session_id` cookie to the new player UUID.
- Returns `{ success: true, playerId }`.

Important behavior:

- The route intentionally does not upsert.
- The same person can create multiple player rows.
- This is useful for frictionless event play, but not for account identity.

### 4. Start Page

`app/start/page.tsx` is a guarded lobby route.

- If no cookie exists, it redirects to `/`.
- If the cookie points to no player row, it redirects to `/`.
- Otherwise it renders `ArcadeLobby`.

The home page already renders the lobby for logged-in users, so `/start` is mostly a direct guarded entry point.

### 5. Arcade Lobby

`components/arcade-lobby.tsx` is the pre-quiz game screen.

It shows:

- Player/company pill
- Sound toggle
- Exit button
- Coin image
- Arcade cabinet image
- Insert coin button

State:

- `stage`: `"cabinet"` or `"inserting"`
- `booted`: used for screen overlay class
- `muted`: persisted to `localStorage` as `arcade_sound_muted`
- `hudMessage`: short countdown text
- `countdown`: numeric countdown, currently not directly rendered except through message text
- `shaking`: cabinet shake effect

Audio:

- Uses Web Audio API directly.
- Generates simple oscillator sounds for button, coin, tick, and success.
- Closes the audio context on unmount.

Insert coin behavior:

- Plays button sound.
- Sets stage to `inserting`.
- Plays coin sound.
- Updates HUD message through a short countdown.
- Shows success sound and shake.
- After about 2.4 seconds, routes to `/quiz`.

Logout behavior:

- Calls `POST /api/logout`.
- Clears the session cookie server-side.
- Replaces route with `/`.
- Shows a toast.

### 6. Quiz Page

`app/quiz/page.tsx` is guarded by the same custom cookie.

It:

- Reads player id from `game_session_id`.
- Redirects home if missing.
- Uses the Supabase admin client.
- Fetches the player profile.
- Fetches the player's best score for `QUIZ_VERSION`.
- Redirects home if the player row is missing.
- Renders `QuizExperience`.

### 7. Quiz Experience

`components/quiz-experience.tsx` is the largest and most important UI file.

It has three visible phases:

- `quiz`: one-question-at-a-time gameplay
- `summary`: local match-over screen before score submission
- reward result: shown when `rewardState` exists after successful submission

Initial state:

- `questions` is set by `getRandomizedQuizQuestions()`.
- `answers` is an array of `-1`, one per displayed question.
- `currentIndex` starts at 0.
- `step` starts as `quiz`.

Question UI:

- Shows `Question X of 10`.
- Displays the current question in a dot-matrix panel.
- Renders four pinball-style answer buttons.
- Selected answer gets a red bumper style.
- Button mouse down triggers a CSS ripple by setting `--ripple-x` and `--ripple-y`.
- If no answer is selected, the bottom area shows a trivia fact panel.
- If an answer is selected, the bottom button advances to the next question.

Navigation:

- `handleSelect(answerIndex)` stores the selected answer for the current question.
- `handleNext()` blocks advancing without an answer.
- On the final question, it switches to summary.

Summary:

- Shows `MATCH OVER` and `JACKPOT CALCULATION`.
- Shows final score as correct answers out of 10.
- Shows targets hit.
- Shows previous high score from the server.
- Offers `SAVE INITIALS` and `INSERT COIN` replay.

Submission:

- `handleSubmitScore()` posts to `/api/submit-score`.
- Payload includes `name`, `companyName`, `answers`, and `quizVersion`.
- Each submitted answer contains `questionId` and `answerIndex`.
- The server ignores client-side scoring and recomputes the result.

Reward state:

- `rank`
- `score`
- `bestScore`
- `correctAnswers`
- `bestCorrectAnswers`
- `rewardUnlocked`

Reward unlock rule:

- Unlocked if saved best score is at least 70.

Reward screen:

- Shows generated score card preview.
- Shows player, company, saved score.
- Shows rank achieved.
- Shows reward status and claim instructions.
- Supports LinkedIn flow, native share, download, caption copy, and replay.

Share behavior:

- Builds a LinkedIn caption from score, name, title, rank, and `#rapyder`.
- Converts generated SVG data URL into PNG through a browser canvas.
- Native share is attempted if `navigator.share` exists.
- LinkedIn fallback downloads the card, copies the caption, and opens LinkedIn composer.

Audio:

- Uses Web Audio API for button, select, success, error, and card reveal sounds.
- The quiz audio does not reuse the lobby mute setting.

Known copy issue:

- The `FACTS` array currently contains mojibake characters such as `Rapyderâ€™s` and `GenAIâ€‘AWS`. That will display incorrectly and should be fixed before production.

### 8. Score Submission

`app/api/submit-score/route.ts` is the core score authority.

It:

- Requires `game_session_id`.
- Validates payload with `submitScoreSchema`.
- Builds a `questionMap` from the full question bank.
- Adds 10 points for each submitted answer where `answerIndex` matches the canonical `correctIndex`.
- Fetches the player row.
- Fetches existing score for `(player_id, quiz_version)`.
- Inserts a score if none exists.
- Updates only if the new score is higher.
- Fetches all leaderboard entries for the current quiz version.
- Computes rank by finding the player in the sorted list.
- Returns `{ score, correctAnswers, bestScore, updated, rank }`.

Important security/logic detail:

- Server-side scoring is good.
- However, the server does not enforce that the submitted question ids are unique or that they match the randomized 10 questions the user actually saw. A crafted request could repeat known correct question ids. This is the biggest anti-cheat gap.

### 9. Score Card API

`app/api/generate-score-card/route.ts` generates an SVG score card data URL on demand.

Input:

- `name`: 2 to 80 chars
- `companyName`: 2 to 120 chars
- `score`: integer 0 to 10

Processing:

- Reads `public/Template_Card 2.jpeg`.
- Reads `public/rapyder-logo-clean.png`.
- Normalizes score with `normalizeScore()`.
- Picks title from score:
  - 95+: `CLOUD QUIZ CHAMPION`
  - 85+: `RAPYDER ELITE`
  - 75+: `CLOUD STRATEGIST`
  - 65+: `DATA RUNNER`
  - lower: `ARCADE CONTENDER`
- Escapes XML text.
- Estimates font sizes to fit text.
- Returns `cardUrl` as base64 SVG data URL.

Notes:

- The schema only allows score 0 to 10, but the helper functions still support 0 to 100. That is harmless but inconsistent.
- The SVG viewBox is 768 x 1408, while `Template_Card 2.jpeg` is 768 x 1376. The background is stretched vertically.
- The browser converts the SVG data URL to PNG before display/download/share.

### 10. Leaderboard

`app/leaderboard/page.tsx`:

- Fetches initial entries on the server with the admin client.
- Passes entries and optional `highlight` query param to `LeaderboardLive`.

`components/leaderboard-live.tsx`:

- Creates a browser Supabase client.
- Renders a dot-matrix high-score table.
- Subscribes to `postgres_changes` on `public.scores`.
- Filters events by `quiz_version`.
- Debounces refetch by 180 ms.
- Refetches top 50 from `leaderboard_entries`.
- Uses JSON string comparison to avoid unnecessary state updates.
- Highlights the player if the URL contains `?highlight=<player_id>`.

Display:

- Columns: rank, player, organization, score.
- Mobile hides organization as a separate column and shows it under player.
- Scores are padded to 6 digits, for example `000100`.

## Quiz Question Bank

The quiz bank lives in `lib/quizQuestions.ts`.

The game randomly picks 10 of these 12 questions per run.

| ID | Question Theme | Correct Answer |
| --- | --- | --- |
| `genai-support-assistant` | GenAI support operations | Building internal knowledge assistants and support copilots |
| `modernization-goal` | Cloud modernization goal | Improving scalability, agility, and maintainability |
| `managed-services-value` | Managed services value | Monitoring, optimization, support, and operational reliability |
| `bfsi-security` | BFSI workload priority | Security, compliance, auditability, and resilience by design |
| `finops-cost-visibility` | FinOps | Tagging, usage analysis, and optimization reviews |
| `data-modernization-outcome` | Data modernization | Easier governance, unification, and analysis for decisions |
| `shared-responsibility` | AWS-style security model | Security responsibilities are split between provider and customer |
| `genai-financial-services` | GenAI in financial services | Summarizing customer interactions and internal knowledge workflows |
| `aws-partner-value` | AWS partner role | Strategy, migration, modernization, security, and operations |
| `modern-architecture-pattern` | Modern architecture | Modular cloud-native services where appropriate |
| `analytics-business-value` | Cloud analytics | Convert operational data into faster, better business decisions |
| `resilience-observability` | Production operations | Observability with monitoring, alerting, and incident response |

## Data Model

Schema file: `supabase/schema.sql`

### Extension

- Enables `pgcrypto` for `gen_random_uuid()`.

### Function

- `public.set_current_timestamp()` updates `updated_at` before row updates.

### Table: `public.players`

Columns:

- `id uuid primary key default gen_random_uuid()`
- `name text not null`
- `company_name text not null`
- `email text not null`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

Current behavior:

- New row per login.
- No unique constraint on email.
- No deduplication.

### Table: `public.scores`

Columns:

- `id uuid primary key default gen_random_uuid()`
- `player_id uuid references public.players(id) on delete cascade`
- `score integer not null check (score >= 0 and score <= 1000)`
- `quiz_version text not null default 'v1'`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

Indexes:

- `scores_score_desc_idx`
- `scores_updated_at_asc_idx`
- `scores_player_id_idx`
- `scores_quiz_version_idx`

Important gap:

- There is no database uniqueness constraint for `(player_id, quiz_version)`. The route tries to preserve one row, but concurrent submissions could create duplicates.

### View: `public.leaderboard_entries`

Joins scores and players.

Exposes:

- `player_id`
- `name`
- `company_name`
- `score`
- `updated_at`
- `quiz_version`

Granted to:

- `authenticated`
- `anon`

### RLS

RLS is enabled on `players` and `scores`.

Policies currently created:

- `Anyone can read players`
- `Anyone can read scores`

Privacy note:

- The leaderboard view avoids exposing email, but the `players` table policy itself allows broad reads for roles with select privilege. Verify actual Supabase grants before launch, because player emails may be queryable through the API if table privileges are available.

## API Contracts

### `POST /api/login`

Request:

```json
{
  "name": "Jane Doe",
  "companyName": "Acme Corporation",
  "email": "jane@company.com"
}
```

Success:

```json
{
  "success": true,
  "playerId": "uuid"
}
```

Side effect:

- Inserts `players`.
- Sets `game_session_id`.

### `POST /api/logout`

Request body:

- None required.

Success:

```json
{
  "success": true
}
```

Side effect:

- Deletes `game_session_id`.

### `POST /api/submit-score`

Request:

```json
{
  "name": "Jane Doe",
  "companyName": "Acme Corporation",
  "quizVersion": "v2",
  "answers": [
    {
      "questionId": "managed-services-value",
      "answerIndex": 1
    }
  ]
}
```

Current validation:

- Requires `name` and `companyName` even though the server uses the cookie player row.
- Requires exactly 10 answers.
- Requires each question id to exist in the question bank.
- Requires answer index 0 to 3.
- Does not validate `quizVersion`.
- Does not enforce unique question ids.

Success:

```json
{
  "score": 80,
  "correctAnswers": 8,
  "bestScore": 80,
  "updated": true,
  "rank": 3
}
```

### `POST /api/generate-score-card`

Request:

```json
{
  "name": "Jane Doe",
  "companyName": "Acme Corporation",
  "score": 8
}
```

Success:

```json
{
  "cardUrl": "data:image/svg+xml;base64,..."
}
```

## Environment Variables

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`

Accepted aliases:

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Browser client needs:

- Supabase URL
- Supabase publishable/anon key

Server admin client needs:

- Supabase URL
- Supabase secret/service-role key

## File Map

### Root Files

| File | Role |
| --- | --- |
| `.env.example` | Shows required Supabase env vars. Uses current secret-key naming. |
| `.gitattributes` | Enables automatic text normalization. |
| `.gitignore` | Ignores `.next`, `node_modules`, env files, dist, coverage, logs. |
| `CHECKPOINT.md` | Historical handoff notes from earlier build iterations. Useful context, but some referenced files are no longer present. |
| `README.md` | Setup/deployment guide, but stale on auth and project structure. |
| `GAME_REFERENCE.md` | This builder reference. |
| `package.json` | Scripts and dependencies. Scripts: `dev`, `build`, `start`, `typecheck`. |
| `package-lock.json` | Lockfile version 3 with 214 package entries. Generated dependency lock. |
| `next.config.ts` | Enables `typedRoutes: true`. |
| `next-env.d.ts` | Next-generated type references. Do not edit manually. |
| `postcss.config.js` | Tailwind and Autoprefixer PostCSS plugins. |
| `tailwind.config.ts` | Tailwind content globs, color tokens, shadows, backgrounds, fonts, animations, keyframes. |
| `tsconfig.json` | Strict TypeScript config with `@/*` path alias. |
| `tsconfig.tsbuildinfo` | Generated TypeScript incremental cache. Should usually not be hand-edited. |
| `vercel.json` | Empty JSON object. No custom Vercel settings currently. |

### App Routes

| File | Lines | Role |
| --- | ---: | --- |
| `app/layout.tsx` | 38 | Global layout, background, header, font, toaster. |
| `app/page.tsx` | 62 | Home page. Shows login/reward preview or lobby depending on cookie. |
| `app/start/page.tsx` | 21 | Guarded direct lobby route. |
| `app/quiz/page.tsx` | 29 | Guarded quiz route. Fetches player and best score. |
| `app/leaderboard/page.tsx` | 22 | Server fetch for initial leaderboard and highlight param. |
| `app/globals.css` | 967+ | Main design system and responsive arcade styling. Has stale/duplicate sections. |

### API Routes

| File | Lines | Role |
| --- | ---: | --- |
| `app/api/login/route.ts` | 44 | Validates login, inserts player, sets session cookie. |
| `app/api/logout/route.ts` | 6 | Clears session cookie. |
| `app/api/submit-score/route.ts` | 96 | Validates answer payload, recomputes score, saves best score, returns rank. |
| `app/api/generate-score-card/route.ts` | 118 | Creates SVG score card from Template Card 2 and logo assets. |

### Components

| File | Lines | Role |
| --- | ---: | --- |
| `components/site-header.tsx` | 29 | Logo link and leaderboard nav. |
| `components/auth-panel.tsx` | 100 | Login form and `/api/login` client flow. |
| `components/arcade-lobby.tsx` | 242 | Insert coin screen, lobby audio, logout, route to quiz. |
| `components/arcade-coin-scene.tsx` | 60 | Three.js floating coin scene. Currently unused by runtime routes. |
| `components/quiz-experience.tsx` | 725 | Main quiz, summary, reward, score-card, sharing, replay, audio. |
| `components/leaderboard-live.tsx` | 167 | Live top-50 leaderboard with Supabase Realtime refetching. |

### Library Files

| File | Lines | Role |
| --- | ---: | --- |
| `lib/env.ts` | 34 | Lazy env accessors with accepted variable aliases. |
| `lib/session.ts` | 21 | Custom cookie session helpers. |
| `lib/supabaseClient.ts` | 18 | Singleton browser Supabase client. |
| `lib/supabaseServer.ts` | 37 | Supabase SSR client helper and admin/service-role client. SSR helper is currently unused. |
| `lib/leaderboard.ts` | 42 | Fetch leaderboard, player profile, and best score. |
| `lib/quizQuestions.ts` | 148 | Quiz version, question count, 12-question bank, shuffle, random selection. |
| `lib/types.ts` | 26 | Shared TypeScript types for questions, submissions, players, leaderboard. |
| `lib/utils.ts` | 4 | `cn()` wrapper around `clsx`. |
| `lib/validation.ts` | 24 | Zod schemas for profile and score submission. |

### Database

| File | Lines | Role |
| --- | ---: | --- |
| `supabase/schema.sql` | 76 | Database extension, tables, indexes, triggers, RLS policies, leaderboard view, Realtime publication. |

### Scripts

| File | Lines | Role |
| --- | ---: | --- |
| `scripts/generate_reward_card.py` | 261 | Offline PNG score-card generator for Template Card 1 or 2. Uses Pillow and PyMuPDF. |
| `scripts/__init__.py` | 0 | Empty Python package marker. |
| `scripts/__pycache__/*` | generated | Python bytecode cache. Not source. |

### Public Assets

| Asset | Dimensions / Size | Current Usage |
| --- | --- | --- |
| `public/Arcade.png` | 2048 x 2048, 1.44 MB | Arcade cabinet image in lobby. |
| `public/Coin.png` | 800 x 800, 258 KB | Coin image in lobby and unused Three.js coin scene. |
| `public/Smartwatch 3d.mp4` | 1.82 MB | Login reward preview video. |
| `public/Rapyder_V2.svg` | SVG viewBox 1926.9 x 1090.3 | Header logo. Also fallback logo source in Python script. |
| `public/_rapyder_logo_clean.svg` | SVG viewBox 1926.9 x 1090.3 | Clean logo variant, currently not referenced by runtime code. |
| `public/rapyder-logo-clean.png` | 13382 x 7572, 785 KB | Score-card API logo source. Very large dimensions for web use. |
| `public/Rapyder_Logo.jpg` | 13382 x 7572, 1.80 MB | Fallback logo source in Python script. |
| `public/Score Card (1).png` | 928 x 1152, 990 KB | Reference/legacy score-card asset. Not used by runtime code. |
| `public/Template_Card 1.jpeg` | 768 x 1408, 315 KB | Supported by Python generator, not runtime API. |
| `public/Template_Card 2.jpeg` | 768 x 1376, 603 KB | Runtime score-card API background and Python generator template. |
| `public/fonts/DMSans-Regular.ttf` | 78 KB | Python card generator font. |
| `public/fonts/DMSans-Medium.ttf` | 78 KB | Python card generator font. |
| `public/fonts/DMSans-Bold.ttf` | 78 KB | Python card generator font. |
| `public/fonts/DMSans-Italic.ttf` | 83 KB | Python card generator font. |

Note: `CHECKPOINT.md` refers to `public/Score Card (2).jpeg`, but that file is not present in the repository at review time.

## Styling And Design System

Primary design language:

- Dark arcade/pinball
- Rapyder red
- Amber neon
- Glassmorphism panels
- Dot-matrix displays
- Chrome bumper controls
- CSS-generated background grids
- Motion, glow, confetti, ripple, and card reveal effects

Tailwind tokens:

- `ink`: black
- `charcoal`: dark gray
- `brand`: `#fc3030`
- `brand-dark`: `#c40000`
- `chalk`: white
- `neon-amber`: `#ffb000`
- `neon-amber-dark`: `#b05000`

Major global CSS groups:

- Glass panels and buttons
- Dot-matrix screens
- Pinball bumper controls
- Arcade background grid
- Arcade lobby layout
- Coin insert animation
- Ripple effects
- LED flicker
- Confetti
- Reward-card reveal/float/shine
- Responsive breakpoints
- Reduced-motion fallback

Known CSS issue:

- `app/globals.css` contains stale or unused sections from previous iterations, including older coin/cabinet classes and `ArcadeCoinScene` styles. The current app works from the active classes, but cleanup would improve maintainability.

## Current Strengths

- Strong branded concept for a B2B event/campaign game.
- Clear high-level flow from login to lobby to quiz to reward to leaderboard.
- Server recomputes score instead of trusting the client score.
- Best-score-only behavior is already implemented.
- Quiz versioning exists and is used consistently in current score/leaderboard logic.
- Live leaderboard is simple and effective.
- UI has strong visual identity and game feel.
- Reward card and social sharing are already integrated into the post-game loop.
- Supabase service key is used only server-side.
- Environment variable aliases make deployment more forgiving.

## Main Risks And Gaps

1. README is materially out of sync with the actual auth/session model.
2. No real authentication or email verification exists.
3. Session cookie stores the raw player UUID and is not signed/encrypted.
4. Every login creates a duplicate player, even for the same email.
5. Player email privacy needs review because table RLS policies are broad.
6. Score submissions can be crafted with duplicate question ids.
7. No rate limiting on login, submit-score, or score-card generation.
8. No CSRF protection beyond SameSite=Lax cookie behavior.
9. No tests are present.
10. Typecheck could not be run in this checkout because `tsc` was not available.
11. `components/quiz-experience.tsx` is doing too much in one 725-line component.
12. `app/globals.css` is large and contains stale classes.
13. Trivia facts contain mojibake text.
14. Score-card template height is inconsistent between asset and SVG output.
15. `ArcadeCoinScene` and `getSupabaseServerClient` are currently unused.
16. The database does not enforce one score per player per quiz version.

## Rating Scorecard

Scores are out of 10 and are based on the current repository state, not the intended future product.

Important context: the `6.7/10` overall score is a production-readiness score. For a controlled single-event game where deep auth, privacy hardening, and long-term abuse resistance are not major concerns, the practical event-readiness score is closer to `7.8/10`. The event version mainly needs a clean Supabase lint fix, working build verification, mobile QA, content cleanup, and reward-card polish.

| Aspect | Score | Reason |
| --- | ---: | --- |
| Product concept | 8.5 | Strong event/campaign idea: lead capture plus branded quiz plus leaderboard. |
| Brand fit | 8.0 | Rapyder/cloud content is woven into quiz, visuals, and reward loop. |
| First-run experience | 7.5 | Login to coin to quiz is memorable, but custom auth semantics are not obvious. |
| Core gameplay | 6.5 | Solid quiz flow, but still a simple MCQ game with limited mechanics. |
| Game feel | 8.0 | Coin animation, SFX, bumper buttons, confetti, glow, and dot-matrix styling create a strong arcade feel. |
| Question quality | 7.0 | Good Rapyder-aligned enterprise cloud themes, but questions are mostly educational and not deeply game-like. |
| Replay value | 6.5 | Random 10-of-12 selection and best-score loop help, but the small bank limits replay depth. |
| Leaderboard | 8.0 | Top 50 with Realtime refetch is useful and event-ready. |
| Reward/share loop | 7.0 | Card generation and LinkedIn/native/download flows are strong, but card rendering has dimension and polish risks. |
| Visual design | 7.5 | Strong identity and asset usage, but some styling is heavy and inconsistent across old/new sections. |
| Responsive design | 7.0 | Many breakpoints and mobile adjustments exist, but full browser QA is not verified here. |
| Accessibility | 5.5 | Forms and buttons are usable, focus styles exist, reduced motion exists, but ARIA/status handling and audio/motion controls need work. |
| Performance | 6.0 | App is not huge, but very large logo assets, MP4, big CSS, and client-heavy card conversion can hurt weaker devices. |
| Frontend architecture | 6.5 | Clear route/component split, but `QuizExperience` is too large and mixes quiz, audio, sharing, card export, and reward logic. |
| Backend/API design | 6.5 | Simple and understandable server routes, but missing rate limiting, CSRF hardening, and stronger attempt validation. |
| Data model | 6.0 | Tables and view are simple, but uniqueness, privacy policy, and attempt modeling are incomplete. |
| Security | 4.5 | Service role is server-only, but custom raw UUID sessions, public-ish read policies, no rate limits, and no anti-CSRF strategy are weak for production. |
| Anti-cheat | 4.5 | Server recomputes score, but crafted duplicate known question ids can likely inflate scores. |
| Privacy/compliance | 4.5 | Collects name, company, email; public read posture needs tightening and retention/consent are not modeled. |
| Type safety | 7.0 | Strict TypeScript and Zod are good. `any` catch and unverified local typecheck reduce confidence. |
| Maintainability | 5.5 | Clear files, but big CSS, large quiz component, stale docs, and unused code raise future-change cost. |
| Documentation before this file | 5.0 | README is useful but stale; CHECKPOINT has context but also obsolete references. |
| Testing/QA | 2.0 | No test files found and typecheck could not run due missing local `tsc`. |
| Deployment readiness | 5.5 | Vercel/Next/Supabase setup is straightforward, but docs, env, QA, security, and dependency install state need attention. |
| Overall current build | 6.7 | Strong branded playable prototype/event app, but not yet hardened or cleaned enough for confident production use. |

## Highest-Impact Improvements

1. Update `README.md` to match the custom session model, or reintroduce Supabase Auth intentionally.
2. Fix anti-cheat by server-issuing an attempt id and validating the exact question set, or at least reject duplicate question ids.
3. Add a unique database constraint on `(player_id, quiz_version)`.
4. Decide whether duplicate players per email are intentional. If not, add upsert/lookup behavior.
5. Tighten RLS/grants so collected emails are not broadly readable.
6. Add rate limiting for login, score submission, and score-card generation.
7. Sign or encrypt the session cookie instead of storing only a raw UUID.
8. Fix mojibake in the quiz facts.
9. Align score-card dimensions with `Template_Card 2.jpeg` or create a 768 x 1408 template asset.
10. Split `QuizExperience` into smaller modules: gameplay, summary, reward card, share actions, audio.
11. Clean stale CSS and unused classes.
12. Remove unused `ArcadeCoinScene` or wire it back into a page intentionally.
13. Optimize oversized logo assets for web delivery.
14. Add tests for score validation, duplicate question rejection, best-score update behavior, and leaderboard sorting.
15. Run browser QA across login, lobby, quiz, submit, reward card, leaderboard, mobile, and reduced motion.

## Phased Improvement Plan

The current 6.7/10 score is not because the idea is weak. The concept, branding, and core flow are already strong. The score is lower because the app is closer to a polished prototype/event build than a hardened production game. These phases are ordered by risk reduction first, then polish and growth.

### Phase 0 - Baseline And Reality Check

Target outcome: get the project into a verifiable state before changing behavior.

Work:

- Run `npm install` so local dependencies and `tsc` exist.
- Run `npm.cmd run typecheck`.
- Run `npm.cmd run build`.
- Manually test the full loop: login, lobby, quiz, score submit, reward card, leaderboard, logout.
- Capture known issues from desktop and mobile.
- Update `README.md` so it matches the real custom-cookie session model.

Expected impact:

- Raises confidence immediately.
- Does not change the game, but removes uncertainty.
- Likely rating movement: 6.7 to 7.0 if builds and manual QA pass.

### Phase 1 - Score Integrity And Anti-Cheat

Target outcome: make leaderboard scores trustworthy.

Work:

- Reject duplicate `questionId` values in `/api/submit-score`.
- Validate that submitted answers contain exactly 10 unique question ids.
- Add a server-created quiz attempt model if possible:
  - Server creates an attempt with the exact randomized question ids.
  - Client submits answers against that attempt id.
  - Server scores only that attempt's question set.
- Add a database uniqueness constraint for one saved score per `(player_id, quiz_version)`.
- Make score submission idempotent and safe under concurrent requests.

Expected impact:

- Biggest gameplay trust improvement.
- Prevents easy crafted-request score inflation.
- Likely rating movement: 7.0 to 7.6.

### Phase 2 - Privacy, Session, And Abuse Protection

Target outcome: make collected player data safer.

Work:

- Decide product identity model:
  - Event mode: keep duplicate players but make that explicit.
  - Account mode: use Supabase Auth or email-based resume/upsert.
- Sign or encrypt the `game_session_id` cookie instead of storing a raw player UUID.
- Tighten Supabase policies/grants so emails are not broadly readable.
- Keep leaderboard public but expose only name, company, score, quiz version, and updated time.
- Add rate limiting for:
  - `/api/login`
  - `/api/submit-score`
  - `/api/generate-score-card`
- Add basic CSRF protection for cookie-authenticated POST routes.

Expected impact:

- Makes the app safer for real event traffic.
- Reduces privacy and abuse risk.
- Likely rating movement: 7.6 to 8.0.

### Phase 3 - UX, Content, And Visual Polish

Target outcome: make the game feel launch-ready to users.

Work:

- Fix mojibake text in the `FACTS` array.
- Expand question bank from 12 to at least 40-60 questions.
- Add difficulty bands or categories:
  - GenAI
  - Migration
  - Managed Services
  - FinOps
  - BFSI/security
  - Data modernization
- Improve replay value by rotating categories and facts.
- Align all score displays around one clear format, preferably `8/10` plus `80/100`.
- Fix score-card dimensions so the SVG output matches the actual template size.
- Polish reward card typography and export quality.
- Add clearer loading states during score-card generation.
- Add a mute setting that also controls quiz SFX, not only lobby SFX.

Expected impact:

- Makes the game more complete and less prototype-like.
- Improves replay value and perceived quality.
- Likely rating movement: 8.0 to 8.4.

### Phase 4 - Codebase Cleanup And Maintainability

Target outcome: make future builders faster and safer.

Work:

- Split `components/quiz-experience.tsx` into smaller modules:
  - `QuizQuestionView`
  - `QuizSummary`
  - `RewardResult`
  - `ScoreCardPreview`
  - `ShareActions`
  - `useQuizAudio`
  - `useScoreCard`
- Clean `app/globals.css`:
  - Remove stale unused arcade classes.
  - Group active styles by page/feature.
  - Keep responsive rules close to the components they affect where practical.
- Remove unused `ArcadeCoinScene` or intentionally wire it into the lobby.
- Remove generated Python `__pycache__` from tracked source if it is tracked.
- Optimize large logo assets for web use.

Expected impact:

- Reduces edit risk.
- Makes the project easier for other builders to extend.
- Likely rating movement: 8.4 to 8.7.

### Phase 5 - Tests, QA, And Release Hardening

Target outcome: make changes confidently deployable.

Work:

- Add unit tests for:
  - score calculation
  - duplicate question rejection
  - best-score-only behavior
  - reward unlock threshold
  - leaderboard sorting
- Add API route tests for invalid payloads and unauthorized submissions.
- Add Playwright smoke tests:
  - login
  - lobby insert coin
  - quiz completion
  - reward card generation
  - leaderboard render
- Test mobile breakpoints.
- Test reduced-motion mode.
- Test failed Supabase/API states.
- Add a deployment checklist for Supabase env vars, schema, Realtime, and Vercel.

Expected impact:

- Converts the app from manually tested to release-ready.
- Likely rating movement: 8.7 to 9.0.

### Phase 6 - Game Depth And Campaign Growth

Target outcome: go beyond a quiz and make it a stronger event/campaign asset.

Work:

- Add timed rounds or time bonus.
- Add streak bonus for consecutive correct answers.
- Add badges/titles based on categories mastered.
- Add seasonal quiz versions and archived leaderboards.
- Add admin export for leads/scores.
- Add event-day controls:
  - reset leaderboard
  - pause submissions
  - hide/show leaderboard
  - export winners
- Add analytics:
  - starts
  - completions
  - drop-off question
  - average score
  - shares/downloads

Expected impact:

- Makes the game more valuable as a marketing/event system.
- Likely rating movement: 9.0 to 9.3+ if execution is clean.

### Priority Recommendation

For the current single-event scope, do these first:

1. Apply the Supabase `security_invoker` view fix.
2. Run install, typecheck, build, and one full browser QA pass.
3. Fix visible text/content issues such as mojibake in the facts.
4. Add only the simplest score-integrity guard: reject duplicate submitted question ids.
5. Polish the score-card output enough for event sharing.

That is enough for a pragmatic event-ready path. The heavier auth/privacy/rate-limit work can stay optional unless this becomes a reusable public campaign product.

## Revised Event 10/10 Plan

This plan assumes the game is for one controlled event, so the goal is not enterprise-grade complexity. The goal is: it looks premium, runs reliably on event day, produces believable scores, and gives people a clean share/reward moment.

### Already Improved

- Supabase leaderboard view changed to `security_invoker` to remove the lint warning.
- Home registration cards now use a brand-colored border glow interaction for a stronger first impression.

### Phase A - Make It Event-Stable

Target score: 8.2/10

- Install dependencies and run `typecheck` and `build`.
- Do one full browser QA pass on laptop and mobile.
- Confirm Supabase env vars work in Vercel.
- Run the schema in Supabase after the `security_invoker` change.
- Test the real event Wi-Fi or hotspot once.

### Phase B - Fix Visible Polish Issues

Target score: 8.7/10

- Fix mojibake text in quiz facts.
- Check all button labels and toasts for event-friendly wording.
- Verify the smartwatch video loads quickly enough.
- Align score display everywhere as `X/10`.
- Fix score-card dimensions and final export appearance.
- Confirm the new border glow does not clip on mobile.

### Phase C - Keep The Leaderboard Fair Enough

Target score: 9.0/10

- Reject duplicate submitted question ids in `/api/submit-score`.
- Add a unique database constraint for `(player_id, quiz_version)`.
- Keep best-score-only behavior.
- Manually test replay and score improvement.

This is enough fairness for a single event without building a full anti-cheat system.

### Phase D - Event-Day Operator Readiness

Target score: 9.4/10

- Create a short event checklist:
  - Supabase project active
  - Vercel deployment active
  - leaderboard opens on display screen
  - QR code points to the game URL
  - reward desk knows unlock threshold
- Prepare one SQL query or Supabase table view for exporting winners.
- Add a simple fallback instruction if the score card download/share fails.
- Test logout/new-player flow for shared devices.

### Phase E - Final Wow Layer

Target score: 9.7-10/10 for event use

- Add a big-screen leaderboard mode if the event has a display.
- Increase question bank to 25-30 questions so replays feel fresher.
- Add one small gameplay bonus, such as a streak label or title, without changing scoring complexity.
- Polish reward card copy and LinkedIn caption.
- Do a final 15-minute live rehearsal with 3-5 test players.

For this event scope, reaching 10/10 means "memorable, reliable, fair enough, and easy to operate", not "enterprise-authenticated and abuse-proof."

## Verification Notes From This Review

What was inspected:

- All app route files
- All API route files
- All components
- All library files
- Supabase schema
- Global CSS and Tailwind config
- Package/config files
- README and checkpoint docs
- Public asset inventory and image dimensions
- Python reward-card generator
- Generated/cache artifacts enough to classify them

Command attempted:

- `npm.cmd run typecheck`

Result:

- Failed because `tsc` was not recognized in this checkout. `node_modules` is not present, so dependencies are not installed locally. No runtime/build verification was completed.

## Builder Mental Model

Think of the current app as five connected systems:

1. Identity/session: lightweight player registration plus cookie.
2. Lobby: immersive insert-coin transition.
3. Quiz: randomized Rapyder/cloud MCQ experience.
4. Score/reward: server score, best score, rank, reward unlock, generated card.
5. Leaderboard: public top-50 live table.

Most future work should preserve that shape unless the product decision changes from event microsite to real authenticated product. If it becomes a real product, the first major rewrite should be auth/session/security, not visuals.
