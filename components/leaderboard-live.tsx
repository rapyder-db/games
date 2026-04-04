"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { QUIZ_VERSION } from "@/lib/quizQuestions";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { LeaderboardEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

type LeaderboardLiveProps = {
  initialEntries: LeaderboardEntry[];
  highlightPlayerId: string | null;
};

function formatScoreFast(score: number) {
  return new Intl.NumberFormat().format(score);
}

export function LeaderboardLive({
  initialEntries,
  highlightPlayerId,
}: LeaderboardLiveProps) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [entries, setEntries] = useState(initialEntries);

  useEffect(() => {
    async function refetchLeaderboard() {
      const { data, error } = await supabase
        .from("leaderboard_entries")
        .select("player_id, name, company_name, score, updated_at, quiz_version")
        .eq("quiz_version", QUIZ_VERSION)
        .order("score", { ascending: false })
        .order("updated_at", { ascending: true })
        .limit(50);

      if (error) {
        toast.error("Network link compromised");
        return;
      }

      setEntries((data ?? []) as LeaderboardEntry[]);
    }

    const channel = supabase
      .channel(`leaderboard-${QUIZ_VERSION}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scores",
          filter: `quiz_version=eq.${QUIZ_VERSION}`,
        },
        () => {
          void refetchLeaderboard();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <>
      <section className="relative z-10 mx-auto w-full max-w-5xl space-y-5 animate-fade-in px-3 sm:space-y-6 sm:px-0">
        
        {/* Glowing Pinball Backglass Title Header */}
        <div className="dot-matrix-screen mb-6 flex flex-col items-start justify-between gap-4 border-[4px] p-4 sm:mb-8 sm:flex-row sm:items-center sm:gap-6 sm:border-[6px] sm:p-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="h-3 w-3 rounded-full bg-brand animate-pulse-neon-red shadow-[0_0_15px_#fc3030]"></span>
              <p className="dot-matrix-text-red text-sm">HIGH SCORES</p>
            </div>
            <h1 className="text-3xl font-mono dot-matrix-text tracking-wide drop-shadow-[0_0_20px_#ffb000] sm:text-5xl">
              CHAMPIONS
            </h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#333] bg-[#111] px-4 py-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#aaa]">TOP 50</span>
          </div>
        </div>

        {/* The Glass Enclosure holding the retro LED screen */}
        <div className="panel-glass bg-black/70 shadow-[0_0_40px_rgba(0,0,0,0.9)] border-white/5">
          <div className="overflow-x-auto rounded-3xl p-2 sm:p-4 lg:p-6">
            
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b-2 border-[#ffb000]/20 text-xs font-mono font-bold uppercase tracking-widest text-[#ffb000]/60">
                  <th className="w-14 px-3 py-4 sm:w-16 sm:px-6 sm:py-5">RNK</th>
                  <th className="px-3 py-4 sm:px-6 sm:py-5">PLYR</th>
                  <th className="hidden sm:table-cell px-3 py-4 sm:px-6 sm:py-5">ORG</th>
                  <th className="w-28 px-3 py-4 text-right sm:w-40 sm:px-6 sm:py-5">SCORE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ffb000]/10">
                {entries.map((entry, index) => {
                  const isHighlighted = highlightPlayerId === entry.player_id;
                  const isFirst = index === 0;

                  return (
                    <tr
                      key={entry.player_id}
                      className={cn(
                        "transition-colors duration-300 font-mono",
                        isHighlighted ? "bg-[#ffb000]/10" : "hover:bg-[#ffb000]/5",
                      )}
                    >
                      <td className="px-3 py-4 sm:px-6 sm:py-5">
                        <span className={cn(
                          "text-base font-bold sm:text-lg",
                          isFirst ? "dot-matrix-text text-xl" : "text-[#888]"
                        )}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-3 py-4 sm:px-6 sm:py-5">
                        <p className={cn("text-base font-bold uppercase tracking-[0.12em] sm:text-xl", isHighlighted ? "dot-matrix-text sm:text-2xl" : "text-[#ddd]")}>
                          {entry.name}
                        </p>
                        <p className="sm:hidden mt-1 text-[0.65rem] uppercase text-[#ffb000]/60 tracking-widest">
                          {entry.company_name}
                        </p>
                      </td>
                      <td className="hidden sm:table-cell px-3 py-4 sm:px-6 sm:py-5">
                        <span className="inline-block px-3 py-1 rounded-sm bg-[#111] border border-[#333] text-[0.7rem] font-bold uppercase tracking-widest text-[#ffb000]/60">
                          {entry.company_name}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-right sm:px-6 sm:py-5">
                        <span className={cn(
                          "text-lg font-bold tracking-[0.18em] sm:text-3xl",
                          isFirst ? "dot-matrix-text-red drop-shadow-[0_0_20px_#fc3030]" : "text-[#fc3030]/80"
                        )}>
                          {String(entry.score).padStart(6, '0')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center dot-matrix-text text-sm">
                      AWAITING COINS...
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
            
          </div>
        </div>
      </section>
    </>
  );
}
