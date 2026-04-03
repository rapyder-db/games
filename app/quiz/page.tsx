import { redirect } from "next/navigation";

import { QuizExperience } from "@/components/quiz-experience";
import { fetchBestScore, fetchPlayerProfile } from "@/lib/leaderboard";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import { getPlayerSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function QuizPage() {
  const playerId = await getPlayerSession();

  if (!playerId) {
    redirect("/");
  }

  const supabase = getSupabaseAdminClient();
  const [playerProfile, bestScore] = await Promise.all([
    fetchPlayerProfile(supabase, playerId),
    fetchBestScore(supabase, playerId),
  ]);

  if (!playerProfile) {
    redirect("/");
  }

  return (
    <QuizExperience
      playerId={playerId}
      userEmail={playerProfile.email}
      initialName={playerProfile.name}
      initialCompanyName={playerProfile.company_name}
      bestScore={bestScore}
    />
  );
}
