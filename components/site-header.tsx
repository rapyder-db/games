import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-full border border-white/70 bg-white/75 px-5 py-3 shadow-panel backdrop-blur">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent text-sm font-bold text-white">
          RQ
        </div>
        <div>
          <p className="font-[var(--font-heading)] text-lg font-semibold">Rapyder Quiz</p>
          <p className="text-xs text-slate-500">Supabase + Realtime leaderboard</p>
        </div>
      </Link>
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/" className="button-secondary px-4 py-2">
          Home
        </Link>
        <Link href="/quiz" className="button-secondary px-4 py-2">
          Quiz
        </Link>
        <Link href="/leaderboard" className="button-primary px-4 py-2">
          Leaderboard
        </Link>
      </nav>
    </header>
  );
}
