import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="relative z-50 mb-10 flex items-center justify-between border-b border-white/10 pb-4 pt-3 sm:mb-14 sm:pb-5 sm:pt-4">
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
      
      <div className="flex items-center gap-4 sm:gap-6">
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
