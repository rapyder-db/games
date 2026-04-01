import { NextResponse } from "next/server";

import { QUIZ_VERSION, quizQuestions } from "@/lib/quizQuestions";
import { getSupabaseAdminClient, getSupabaseServerClient } from "@/lib/supabaseServer";
import { submitScoreSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = submitScoreSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid payload",
      },
      { status: 400 },
    );
  }

  const admin = getSupabaseAdminClient();
  const score = parsed.data.answers.reduce((total, answer, index) => {
    return total + (answer === quizQuestions[index].correctIndex ? 10 : 0);
  }, 0);
  const correctAnswers = score / 10;

  const { data: player, error: playerError } = await admin
    .from("players")
    .upsert(
      {
        user_id: user.id,
        name: parsed.data.name,
        company_name: parsed.data.companyName,
        email: user.email,
      },
      {
        onConflict: "user_id",
      },
    )
    .select("*")
    .single();

  if (playerError || !player) {
    return NextResponse.json(
      {
        error: playerError?.message ?? "Unable to save player profile",
      },
      { status: 500 },
    );
  }

  const { data: existingScore, error: existingScoreError } = await admin
    .from("scores")
    .select("id, score")
    .eq("user_id", user.id)
    .eq("quiz_version", QUIZ_VERSION)
    .maybeSingle();

  if (existingScoreError) {
    return NextResponse.json({ error: existingScoreError.message }, { status: 500 });
  }

  let bestScore = existingScore?.score ?? score;
  let updated = false;

  if (!existingScore) {
    const { error } = await admin.from("scores").insert({
      user_id: user.id,
      player_id: player.id,
      email: user.email,
      score,
      quiz_version: QUIZ_VERSION,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    bestScore = score;
    updated = true;
  } else if (score > existingScore.score) {
    const { error } = await admin
      .from("scores")
      .update({
        player_id: player.id,
        email: user.email,
        score,
      })
      .eq("id", existingScore.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    bestScore = score;
    updated = true;
  }

  return NextResponse.json({
    score,
    correctAnswers,
    bestScore,
    updated,
  });
}
