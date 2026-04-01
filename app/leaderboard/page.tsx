import { LeaderboardLive } from "@/components/leaderboard-live";
import { fetchLeaderboard } from "@/lib/leaderboard";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

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
  const supabase = await getSupabaseServerClient();
  const entries = await fetchLeaderboard(supabase);

  return (
    <LeaderboardLive
      initialEntries={entries}
      highlightUserId={params.highlight ?? null}
    />
  );
}
