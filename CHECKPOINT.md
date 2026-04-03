# Rapyder Website Checkpoint

Last updated: 2026-04-02

## What This Website Is Trying To Be

This project is not just a generic quiz app. It is a branded Rapyder microsite that appears to be designed as an interactive cloud-competency experience with a competitive layer.

The product direction, based on the live code, looks like this:

- A visitor lands on a premium, high-energy Rapyder homepage.
- The page frames the experience as a "cloud assessment" or "intelligence protocol" rather than a plain form.
- The visitor enters name, company, and email to start a session.
- The visitor takes a short 10-question enterprise/cloud quiz.
- Their result is saved and compared against others.
- A live leaderboard makes the experience feel event-like, game-like, and socially competitive.

At a business level, this looks like a mix of:

- Brand activation for Rapyder
- Lead capture
- Lightweight qualification of visitors by cloud familiarity
- Gamified engagement for an event, campaign, or internal/external competition

The site is trying to make a B2B cloud consulting brand feel more immersive and memorable by wrapping an otherwise simple assessment in strong visual theming.

## Core Product Thesis

The current implementation suggests this message:

"Rapyder helps organizations with cloud, modernization, managed services, data, and GenAI. Instead of telling users that in brochure form, the site makes them participate in a short cloud knowledge challenge and then see how they rank."

That means the website is doing three jobs at once:

1. It presents Rapyder as a modern cloud/technology brand.
2. It captures user identity details before the main interaction.
3. It creates urgency and replay value through scoring and ranking.

## Experience And Creative Direction

There are two overlapping design languages in the code:

1. Corporate futuristic / intelligence-system language
2. Retro arcade / pinball machine language

Examples from the implementation:

- Home page copy uses phrases like `Rapyder Intelligence Protocol`, `Initiate Assessment`, `Global Rankings`, `Diagnostic Pathway`, `Session Initialization`, and `Assessment Matrix`.
- The quiz and leaderboard UI switch heavily into pinball/arcade metaphors:
  - `BALL 1 / 10`
  - `PLAYER 1`
  - `HIT FLIPPER`
  - `LOCK MULTIBALL`
  - `SAVE INITIALS`
  - `HIGH SCORES`
  - `CHAMPIONS`

Visually, the app is built around:

- Full-screen looping video background
- Dark black base
- Red neon brand accents
- Amber LED scoreboard accents
- Glassmorphism panels
- Dot-matrix display styling
- Chrome bumper-style answer buttons

So the intended feel is not "SaaS dashboard." It is "premium branded game experience for a cloud consulting company."

## Current User Journey

### 1. Landing page

File: `app/page.tsx`

The homepage currently does the following:

- Shows the Rapyder logo and a dramatic branded hero.
- Frames the app as a 10-phase, 100-point assessment.
- Provides two main calls to action:
  - Go to quiz
  - View leaderboard
- Shows the auth panel in the right column.
- Shows a short 4-step pathway explaining the flow.

If a user already has a local session cookie, the homepage fetches their player row and shows an active-session panel instead of the login form.

### 2. Session creation / login

Files:

- `components/auth-panel.tsx`
- `app/api/login/route.ts`
- `lib/session.ts`

The current login system is not real auth in the conventional sense.

What it actually does:

- Collects `name`, `companyName`, and `email`.
- Sends those values to `POST /api/login`.
- Server validates the payload with Zod.
- Server inserts a brand new row into `public.players`.
- Server sets a cookie called `game_session_id` containing the player UUID.

Important implication:

- This is really a lightweight registration/session mechanism, not authentication.
- There is no email verification.
- There is no password.
- There is no Supabase Auth session.
- The cookie itself is the identity anchor.

### 3. Quiz experience

Files:

- `app/quiz/page.tsx`
- `components/quiz-experience.tsx`
- `lib/quizQuestions.ts`

The quiz route:

- Requires the custom session cookie.
- Loads the player's profile and current best score from the database.
- Redirects home if the session is missing or the player row does not exist.

The quiz UI:

- Shows one question at a time.
- Tracks selected answers in local React state.
- Prevents advancing without selecting an answer.
- Calculates a local display score and local correct-count during play.
- Shows a summary screen after the final question.
- Lets the user submit the score or restart.

The quiz content is fixed in code and currently focuses on:

- Cloud migration
- Managed services
- GenAI
- VDI
- BFSI
- Cloud benefits
- Architecture reviews
- Data modernization
- Shared responsibility
- Partner role

This strongly suggests the site is intended to reinforce Rapyder's service areas and position the company around enterprise cloud transformation.

### 4. Score submission

File: `app/api/submit-score/route.ts`

The submit flow:

- Requires the session cookie.
- Accepts the submitted answer array.
- Validates payload shape with Zod.
- Recomputes score on the server using the canonical question answer key.
- Reads the player's existing score for the same `quiz_version`.
- Inserts a new score row if none exists.
- Updates the score only if the new score is better.

This means the leaderboard is best-score-only per player per quiz version.

### 5. Leaderboard

Files:

- `app/leaderboard/page.tsx`
- `components/leaderboard-live.tsx`
- `lib/leaderboard.ts`

The leaderboard:

- Loads initial top 50 entries on the server.
- Subscribes to Supabase Realtime on the `scores` table.
- Refetches when score rows change.
- Highlights the just-submitted player if `highlight` is present in the URL.

This is designed to make the ranking page feel active and event-driven rather than static.

## Actual Architecture In The Current Codebase

### Frontend

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS
- Sonner for toast notifications

### Backend/Data

- Supabase Postgres
- Supabase Realtime for leaderboard refreshes
- Direct service-role database access from server routes

### Session model

- Custom HTTP-only cookie in `lib/session.ts`
- No real user auth provider in the current implementation

## Data Model

File: `supabase/schema.sql`

### `players`

Stores:

- `id`
- `name`
- `company_name`
- `email`
- timestamps

### `scores`

Stores:

- `id`
- `player_id`
- `score`
- `quiz_version`
- timestamps

### `leaderboard_entries` view

Joins `scores` and `players` so the leaderboard can read:

- player id
- name
- company name
- score
- updated time
- quiz version

## Design System Notes

Files:

- `app/globals.css`
- `tailwind.config.ts`
- `app/layout.tsx`

The current design system is coherent and intentional.

Main characteristics:

- Black `ink` background
- Brand red `#fc3030`
- Neon amber `#ffb000`
- DM Sans body typography
- Monospace display typography for arcade/score surfaces
- Glassmorphism containers
- Dot-matrix LED presentation
- Chrome/bumper gradients for interactive controls
- Ambient full-screen MP4 background

The homepage and shell still lean more "premium corporate futuristic."
The quiz and leaderboard lean much harder into "retro pinball machine."

That means the site currently has a hybrid identity instead of a single pure theme. That may be intentional, but it is worth remembering because future edits could either:

- unify the two modes more tightly, or
- intentionally split them into "corporate entry" and "arcade gameplay" phases.

## What Is Implemented Versus What The README Says

This repository appears to be in transition.

The `README.md` describes a more formal Supabase Auth based application with:

- magic link auth
- optional Google OAuth
- callback route
- RLS tied to authenticated users

But the actual code now does this instead:

- custom cookie session
- direct `players` insert on login
- no callback route
- no OAuth flow
- no authenticated-user ownership model

Evidence of that transition:

- `app/auth/callback/route.ts` is deleted in git status.
- `middleware.ts` is deleted in git status.
- `app/api/login` and `app/api/logout` are newly added.
- `lib/session.ts` is newly added.
- `supabase/schema.sql` has public-read style policies rather than auth-owned policies.

So the current product should be understood as:

"A simplified event/game microsite version of an earlier more formal auth-based quiz app."

## Important Behavioral Details

### 1. Duplicate players are currently allowed by design

In `app/api/login/route.ts`, every login inserts a new player row.

Effects:

- Same email can create multiple player entries.
- Same person can appear many times historically.
- A fresh login creates a new identity instead of resuming an old one.

This may be intentional for event kiosks or repeated game entries, but it is not standard account behavior.

### 2. Score display and server score are inconsistent

The client-side quiz UI awards:

- `1000` points per correct answer

The server-side submit route awards:

- `10` points per correct answer

This creates a major mismatch:

- The summary screen can show scores like `010000`
- The saved leaderboard score is actually out of `100`

This is currently one of the most important implementation inconsistencies in the repo.

### 3. The quiz version concept already exists

There is a `QUIZ_VERSION = "v1"` constant used in:

- question set logic
- score lookups
- leaderboard filtering
- realtime subscriptions

That means the codebase is already structured for future seasonal resets, alternate question sets, or campaign-based leaderboards.

### 4. The leaderboard is public-ish

Current policies and grants allow broad read access to:

- players
- scores
- leaderboard view

This is much more open than the older README security model suggests.

### 5. Profile data is collected before gameplay

This is a strong signal that the website is not only entertainment.
It is also collecting identifiable lead/contact context:

- name
- organization
- corporate email

## Product Intent I Infer From The Current Build

The most likely intent is:

- Rapyder wants a branded interactive web experience
- The experience should feel more memorable than a plain corporate quiz
- Users should identify themselves before playing
- The content should subtly educate users on Rapyder's service categories
- The leaderboard should add urgency, competitiveness, and social proof
- The whole thing should be simple enough to run on a campaign/event stack without complicated account management

In short:

"A gamified Rapyder cloud knowledge challenge that doubles as a lead-capture and engagement asset."

## Repo Areas That Matter Most

If someone resumes work later, these are the most important files to read first:

### Product shell and UX

- `app/layout.tsx`
- `app/page.tsx`
- `components/site-header.tsx`
- `app/globals.css`
- `tailwind.config.ts`

### Quiz flow

- `app/quiz/page.tsx`
- `components/quiz-experience.tsx`
- `lib/quizQuestions.ts`
- `lib/validation.ts`

### Leaderboard

- `app/leaderboard/page.tsx`
- `components/leaderboard-live.tsx`
- `lib/leaderboard.ts`
- `lib/types.ts`

### Session and backend logic

- `app/api/login/route.ts`
- `app/api/logout/route.ts`
- `app/api/submit-score/route.ts`
- `lib/session.ts`
- `lib/supabaseServer.ts`
- `supabase/schema.sql`

## Current State Of The Repo

The git worktree shows the app is mid-refactor.

High-level picture:

- Visual redesign is in progress or recently completed.
- Auth model was simplified from Supabase Auth to custom cookie session.
- Some documentation is now stale.
- Some server/database behavior has been adapted to match the new simpler flow.

This means future work should be careful about assuming the README is the source of truth. The code is the source of truth right now.

## Likely Next Decisions To Make

The main strategic decisions still open in this codebase appear to be:

### 1. Is this a true auth product or a campaign/event experience?

If campaign/event:

- current simple session model may be acceptable
- duplicate identities may even be useful

If true product/account system:

- current login approach is not sufficient
- real auth and ownership rules need to return

### 2. Is the score meant to feel arcade-like or enterprise-like?

Right now the UI implies arcade scoring, but persistence uses a normal quiz score.

You likely need one clear choice:

- keep arcade score everywhere, or
- keep percentage-style score everywhere

### 3. Should the quiz remain generic cloud literacy or become more Rapyder-specific?

Current questions are broad and service-oriented.

Possible directions:

- keep broad educational positioning
- make it more brand-specific
- split into difficulty tiers or service tracks

### 4. Should the design lean more unified?

Current result:

- homepage = elegant corporate glass
- quiz/leaderboard = aggressive retro arcade

That can work, but it may need tighter connective tissue if the goal is a single unmistakable brand language.

## Risks / Gaps To Remember

- README is materially out of sync with the implementation.
- There is no true authentication, only a custom session cookie.
- Player rows are duplicated on every login.
- Score math differs between client display and server persistence.
- Public read access may be broader than desired for collected player data.
- There are no visible tests in the repo.
- Validation ensures answer count and value range, but not necessarily deeper anti-abuse controls.

## Best One-Sentence Summary

This website is a branded Rapyder cloud-knowledge game: a stylized lead-capture quiz with a live competitive leaderboard, currently implemented as a lightweight session-based microsite rather than a fully authenticated product.

---

## Handoff Checkpoint

Last updated: 2026-04-03

This section is the latest working handoff for the next LLM. Prefer this over the older checkpoint sections when they conflict.

### What Was Completed In This Session

#### 1. Arcade lobby asset fix

Problem:

- Replaced arcade PNGs were showing with a white background.

Root cause:

- Code was still referencing deleted filenames:
  - `/Game Coin.H03.2k.png`
  - `/Arcade Machine.H03.2k.png`

What changed:

- Updated the lobby and coin scene to use:
  - `/Coin.png`
  - `/Arcade.png`

Files:

- `components/arcade-coin-scene.tsx`
- `components/arcade-lobby.tsx`

Status:

- User confirmed this is fixed and working.

#### 2. Arcade lobby visual/layout pass

What changed:

- Insert coin button moved into the same cabinet stage container.
- Button placement adjusted lower.
- Cabinet overlay text `INSERT COIN` removed from the machine.
- Coin moved back toward the left.
- Coin idle/insert motion was reworked to be smoother.
- Later the lobby component was rewritten cleanly to remove mojibake/corrupted strings.

Files:

- `components/arcade-lobby.tsx`
- `app/globals.css`

Status:

- Lobby is in a usable state.
- The current lobby file is the rewritten clean version and should be treated as source of truth.

#### 3. Responsive pass across core screens

What changed:

- Fluid arcade sizing via CSS variables and breakpoints.
- Login, quiz, leaderboard, and lobby spacing tightened for smaller screens.
- Header got responsive adjustments.
- Added focus-visible rules.
- Added reduced-motion fallback.
- Replaced broken global video-background dependency with CSS-based background layers because `/Pin Ball loop 3D.mp4` is no longer present.

Files:

- `app/globals.css`
- `app/layout.tsx`
- `app/page.tsx`
- `components/auth-panel.tsx`
- `components/quiz-experience.tsx`
- `components/leaderboard-live.tsx`
- `components/site-header.tsx`

Important note:

- Old CSS contains stale sections that still exist lower in the file. The current app works, but `app/globals.css` should still be cleaned up later because there is duplicated older arcade styling.

#### 4. Login reward preview

What changed:

- Added `Smartwatch 3d.mp4` as an autoplaying loop in the login hero.
- No visible controls, muted, inline autoplay.

Files:

- `app/page.tsx`
- asset: `public/Smartwatch 3d.mp4`

Status:

- Implemented.

#### 5. Logo sizing in navbar

What changed:

- Logo size was iterated a few times.
- Final user-approved size is now width-driven and considered correct by the user.

File:

- `components/site-header.tsx`

Status:

- User explicitly said the current logo sizing looks great and fine.

#### 6. Quiz content overhaul and randomization

What changed:

- Replaced the old generic cloud quiz question bank with Rapyder-positioned questions aligned to:
  - GenAI
  - modernization
  - managed services
  - FinOps / optimization
  - data modernization
  - BFSI / security / compliance
- Added random question selection from a larger pool.
- Replay now reshuffles a fresh quiz.
- Submission payload changed from raw answer indexes by order to:
  - `questionId`
  - `answerIndex`
- Server-side scoring now scores by `questionId`.
- Validation updated accordingly.
- Quiz version was bumped from `v1` to `v2`.

Files:

- `lib/quizQuestions.ts`
- `lib/validation.ts`
- `lib/types.ts`
- `components/quiz-experience.tsx`
- `app/api/submit-score/route.ts`

Status:

- Implemented in code.
- Not fully runtime-verified in this session.

#### 7. Reward unlock screen

What changed:

- Added a post-submit reward state after quiz submission.
- API now returns current player rank.
- Reward screen shows:
  - rank achieved
  - reward unlocked / locked
  - claim instructions
  - leaderboard CTA
  - replay CTA
- Reward unlock is currently:
  - unlocked if `bestScore >= 70`

Files:

- `app/api/submit-score/route.ts`
- `components/quiz-experience.tsx`

Status:

- Implemented in code.
- Needs QA in browser.

#### 8. Reward/share card UI enhancement

What changed:

- Reward screen card was upgraded into a more premium HTML-based branded card.
- Added:
  - Rapyder logo inside the card
  - player title helper
  - richer score hierarchy
  - `Share Score Card`
  - `Copy Tagged Message`
- Share copy now references `Rapyder Cloud Solutions` in the generated message.

Files:

- `components/quiz-experience.tsx`

Status:

- Implemented in UI.
- User still did not like the visual quality of the generated card concept.

### Where We Got Stuck

#### Main active blocker: automated score card generation

The user asked for an actual generated reward card image, not just an HTML reward card.

What happened:

1. First attempt:

- A generic SVG reward card template was created.
- User said it was not good enough.

Artifacts:

- `public/reward-card-rapyder-template.svg`
- `public/generated-score-card.svg`

2. Second attempt:

- User provided reference examples in `public`.
- Then user asked to use `Score Card (1)` as reference and `Template_Card 1.jpeg` as base.
- A Python generator was created for that.

Artifacts:

- `scripts/generate_reward_card.py`
- `public/generated-score-card-template1.png`

3. Third attempt:

- User changed direction again:
  - use `Score Card (2)` as reference
  - use `Template_Card 2.jpeg` as the base
- The Python generator was then rewritten again to target `Template_Card 2.jpeg`.

Current generator state:

- `scripts/generate_reward_card.py` is now the Template Card 2 version.
- It uses:
  - `Pillow`
  - `fitz` / `PyMuPDF`
- It rasterizes the real `public/Rapyder_V2.svg` logo successfully.

Current base assets involved:

- `public/Score Card (2).jpeg`
- `public/Template_Card 2.jpeg`
- `public/Rapyder_V2.svg`

Important:

- The generator rewrite for Template Card 2 was written, but not yet run and visually reviewed after the user’s latest direction change.
- The assistant was interrupted by the user asking:
  - `just a question is this being done in python`
- Then the user asked for this checkpoint.

So the exact next implementation step is:

1. Run:

```powershell
python scripts\generate_reward_card.py --name "Alex Johnson" --company "Techcorp India" --score 98 --out "public\generated-score-card-template2.png"
```

2. Open and inspect:

- `public/generated-score-card-template2.png`

3. Compare visually against:

- `public/Score Card (2).jpeg`

4. Iterate until the user is happy.

### Technical Notes For The Next LLM

#### Python image generation stack available locally

Confirmed available:

- `PIL`
- `fitz`
- `reportlab`

Not available:

- `cairosvg`
- `svglib`
- `magick`
- `inkscape`
- `rsvg-convert`
- `chrome`
- `chromium`
- `msedge`

Implication:

- Python rasterization should use `fitz` for SVG logo rendering.
- Do not rely on ImageMagick, Inkscape, or browser screenshot export.

#### Important file to inspect first for score-card work

- `scripts/generate_reward_card.py`

This file currently targets:

- `Template_Card 2.jpeg`

If the next LLM sees a mismatch between the user’s request and older generated outputs, the latest direction is:

- Reference style: `public/Score Card (2).jpeg`
- Base template: `public/Template_Card 2.jpeg`
- Generation method: Python

#### Temporary/generated artifacts now in public

These are exploratory outputs and may be disposable:

- `public/generated-score-card.svg`
- `public/generated-score-card-template1.png`
- `public/_logo_test.png`

These are not final approved assets.

### High-Risk Inconsistencies Still Present

1. Score display mismatch still exists conceptually

- Quiz UI still uses large arcade-style local score.
- Backend stores 0-100 score.
- Reward card and leaderboard now lean toward 0-100.
- This should be unified before launch.

2. `app/globals.css` still has stale/duplicate sections

- The latest logic works, but the file is not clean.
- Future edits should be careful because older rules remain below newer ones.

3. Browser QA has not been completed

The following should be tested:

- login flow
- lobby flow
- quiz randomization
- score submit
- reward screen
- leaderboard highlight
- mobile layout

### Short Version For Next LLM

If continuing immediately:

1. Do not touch the logo sizing. User approved it.
2. Do not revisit Template Card 1. The current target is Template Card 2.
3. Use Python, not manual design or SVG-only mockups.
4. Run and refine `scripts/generate_reward_card.py` against:
   - `public/Score Card (2).jpeg`
   - `public/Template_Card 2.jpeg`
5. Produce:
   - `public/generated-score-card-template2.png`
6. Show that to the user and iterate visually from there.
