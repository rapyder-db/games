# Rapyder Arcade Event Runbook

## Pre-Event Checks

- Supabase project is active and not paused.
- Vercel production deployment is active.
- Vercel env vars are set for Production: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`.
- `https://YOUR_DOMAIN/api/health` returns `{"ok":true,...}` after deployment.
- Run `supabase/schema.sql` in Supabase SQL Editor after pulling this version.
- Open `/leaderboard?display=1` on the display screen.
- QR code points to the production game URL.
- Reward desk knows the unlock threshold: `7/10` or higher.
- Test one login, quiz submit, leaderboard update, card download, LinkedIn copy, logout, and second player login on the real event Wi-Fi or hotspot.

## Shared Device Flow

1. Register player with name, company, and email.
2. Start Challenge.
3. Complete the quiz and save score.
4. Download/share the score card.
5. Use `Exit` before handing the device to the next player.
6. Confirm the home page shows the registration form again.

## If Score Card Share Fails

- Tap `Open` on the score card and take a screenshot.
- Or tap `Download Card` and upload the image manually.
- The reward desk can verify the saved score on `/leaderboard` or `/leaderboard?display=1`.

## Winner Export

- Run `supabase/export-winners.sql` in Supabase SQL Editor.
- Export the result as CSV from Supabase.
- Sort is already event-ready: highest score first, earlier timestamp wins ties.
