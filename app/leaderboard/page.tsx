import { LeaderboardLive } from "@/components/leaderboard-live";
import { fetchLeaderboard } from "@/lib/leaderboard";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type LeaderboardPageProps = {
  searchParams: Promise<{
    highlight?: string;
  }>;
};

export default async function LeaderboardPage({
  searchParams,
}: LeaderboardPageProps) {
  const params = await searchParams;
  const supabase = getSupabaseAdminClient();
  const entries = await fetchLeaderboard(supabase);

  return (
    <LeaderboardLive
      initialEntries={entries}
      highlightPlayerId={params.highlight ?? null}
    />
  );
}
