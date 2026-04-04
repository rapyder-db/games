import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header relative z-50 mb-6 flex items-center justify-between gap-3 border-b border-white/10 pb-3 pt-2 sm:mb-8 sm:gap-5 sm:pb-4 sm:pt-3">
      <Link
        href="/"
        className="flex items-center gap-4 rounded-xl transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <Image
          src="/Rapyder_V2.svg"
          alt="Rapyder Logo"
          width={360}
          height={104}
          className="h-auto w-[100px] object-contain drop-shadow-md sm:w-[136px] lg:w-[164px]"
          priority
        />
      </Link>

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
