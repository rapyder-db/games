import Link from "next/link";

import { AuthPanel } from "@/components/auth-panel";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="panel bg-hero-glow p-8 sm:p-10">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Cloud Quiz Experience</p>
        <h1 className="mt-4 max-w-3xl font-[var(--font-heading)] text-5xl font-semibold leading-tight sm:text-6xl">
          Rapyder Quiz + <span className="text-brand">Live Leaderboard</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-600">
          A production-ready quiz app built on Next.js, Supabase Auth, Postgres, and Realtime.
          Sign in, answer 10 MCQs, submit your best score, and watch the leaderboard update live.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/quiz" className="button-primary">
            Start Quiz
          </Link>
          <Link href="/leaderboard" className="button-secondary">
            View Leaderboard
          </Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="panel-muted p-4">
            <p className="text-sm text-slate-500">Questions per run</p>
            <p className="mt-2 text-2xl font-semibold">10</p>
          </div>
          <div className="panel-muted p-4">
            <p className="text-sm text-slate-500">Scoring</p>
            <p className="mt-2 text-2xl font-semibold">10 pts / correct</p>
          </div>
          <div className="panel-muted p-4">
            <p className="text-sm text-slate-500">Realtime</p>
            <p className="mt-2 text-2xl font-semibold">Top 50 live</p>
          </div>
        </div>
      </section>

      <div className="space-y-6">
        <AuthPanel initialEmail={user?.email ?? null} />
        <section className="panel p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">How it works</p>
          <ol className="mt-4 space-y-3 text-sm text-slate-600">
            <li>1. Sign in with magic link or Google via Supabase Auth.</li>
            <li>2. Fill in your name and company, then answer 10 questions.</li>
            <li>3. Submit your score through a server route with validation.</li>
            <li>4. Watch the leaderboard refresh live with Supabase Realtime.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
