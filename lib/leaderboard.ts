import type { SupabaseClient } from "@supabase/supabase-js";

import { QUIZ_VERSION } from "@/lib/quizQuestions";
import type { LeaderboardEntry, PlayerProfile } from "@/lib/types";

export async function fetchLeaderboard(
  client: SupabaseClient,
  quizVersion = QUIZ_VERSION,
) {
  const { data, error } = await client
    .from("leaderboard_entries")
    .select("user_id, player_id, name, company_name, score, updated_at, quiz_version")
    .eq("quiz_version", quizVersion)
    .order("score", { ascending: false })
    .order("updated_at", { ascending: true })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as LeaderboardEntry[];
}

export async function fetchPlayerProfile(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("players")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as PlayerProfile | null;
}

export async function fetchBestScore(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("scores")
    .select("score")
    .eq("user_id", userId)
    .eq("quiz_version", QUIZ_VERSION)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.score ?? null;
}
