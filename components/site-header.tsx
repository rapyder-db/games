import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  const statusItems = ["LIVE", "HIGH SCORE", "INSERT COIN", "READY"];

  return (
    <header className="site-header relative z-50 mb-10 grid items-center gap-3 border-b border-white/10 pb-4 pt-3 sm:mb-14 sm:grid-cols-[auto_1fr_auto] sm:gap-6 sm:pb-5 sm:pt-4">
      <Link
        href="/"
        className="flex items-center gap-4 rounded-xl transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <Image
          src="/Rapyder_V2.svg"
          alt="Rapyder Logo"
          width={360}
          height={104}
          className="h-auto w-[126px] object-contain drop-shadow-md sm:w-[156px] lg:w-[192px]"
          priority
        />
      </Link>

      <div className="arcade-nav-center">
        <div className="arcade-nav-badge" aria-hidden="true">
          <span className="arcade-nav-spark arcade-nav-spark-left" />
          <span className="arcade-nav-spark arcade-nav-spark-right" />
          <span className="arcade-nav-scan" />
          <div className="arcade-nav-core">
            <span className="arcade-nav-kicker">Live Cabinet</span>
            <span className="arcade-nav-status-window">
              <span className="arcade-nav-status-track">
                {statusItems.concat(statusItems[0]).map((item, index) => (
                  <span key={`${item}-${index}`} className="arcade-nav-status-item">
                    {item}
                  </span>
                ))}
              </span>
            </span>
            <span className="arcade-nav-title">Rapyder Arcade</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 sm:gap-6">
        <Link
          href="/leaderboard"
          className="rounded-xl px-2 py-1 text-[0.7rem] font-semibold uppercase tracking-widest text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:text-xs"
        >
          Leaderboard
        </Link>
      </div>
    </header>
  );
}
