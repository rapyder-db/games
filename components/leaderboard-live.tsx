"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { LeaderboardEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

type LeaderboardLiveProps = {
  initialEntries: LeaderboardEntry[];
  highlightUserId: string | null;
};

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function LeaderboardLive({
  initialEntries,
  highlightUserId,
}: LeaderboardLiveProps) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [entries, setEntries] = useState(initialEntries);

  useEffect(() => {
    async function refetchLeaderboard() {
      const { data, error } = await supabase
        .from("leaderboard_entries")
        .select("user_id, player_id, name, company_name, score, updated_at, quiz_version")
        .eq("quiz_version", "v1")
        .order("score", { ascending: false })
        .order("updated_at", { ascending: true })
        .limit(50);

      if (error) {
        toast.error("Realtime refresh failed");
        return;
      }

      setEntries((data ?? []) as LeaderboardEntry[]);
    }

    const channel = supabase
      .channel("leaderboard-v1")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scores",
          filter: "quiz_version=eq.v1",
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
    <section className="space-y-5">
      <div className="panel flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Live leaderboard</p>
          <h1 className="mt-2 font-[var(--font-heading)] text-3xl font-semibold">
            Top 50 players
          </h1>
        </div>
        <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 text-sm">
          <button type="button" className="rounded-full bg-white px-4 py-2 font-medium shadow-sm">
            All-time
          </button>
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-4 font-medium">Rank</th>
                <th className="px-5 py-4 font-medium">Name</th>
                <th className="px-5 py-4 font-medium">Company</th>
                <th className="px-5 py-4 font-medium">Score</th>
                <th className="px-5 py-4 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => {
                const isHighlighted = highlightUserId === entry.user_id;

                return (
                  <tr
                    key={entry.user_id}
                    className={cn(
                      "border-t border-slate-200",
                      isHighlighted && "bg-amber-50/80",
                    )}
                  >
                    <td className="px-5 py-4 font-semibold text-slate-700">#{index + 1}</td>
                    <td className="px-5 py-4">{entry.name}</td>
                    <td className="px-5 py-4 text-slate-600">{entry.company_name}</td>
                    <td className="px-5 py-4 font-semibold text-brand">{entry.score}</td>
                    <td className="px-5 py-4 text-slate-500">
                      {formatTimestamp(entry.updated_at)}
                    </td>
                  </tr>
                );
              })}
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                    No scores submitted yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
