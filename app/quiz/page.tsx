import { redirect } from "next/navigation";

import { QuizExperience } from "@/components/quiz-experience";
import { fetchBestScore, fetchPlayerProfile } from "@/lib/leaderboard";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function QuizPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/");
  }

  const [playerProfile, bestScore] = await Promise.all([
    fetchPlayerProfile(supabase, user.id),
    fetchBestScore(supabase, user.id),
  ]);

  return (
    <QuizExperience
      userId={user.id}
      userEmail={user.email}
      initialName={playerProfile?.name ?? ""}
      initialCompanyName={playerProfile?.company_name ?? ""}
      bestScore={bestScore}
    />
  );
}
