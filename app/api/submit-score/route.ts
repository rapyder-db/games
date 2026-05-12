import { NextResponse } from "next/server";

import { QUIZ_VERSION, quizQuestions } from "@/lib/quizQuestions";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import { submitScoreSchema } from "@/lib/validation";
import { getPlayerSession } from "@/lib/session";

export async function POST(request: Request) {
  const playerId = await getPlayerSession();

  if (!playerId) {
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

  const submittedQuestionIds = parsed.data.answers.map((answer) => answer.questionId);

  if (new Set(submittedQuestionIds).size !== submittedQuestionIds.length) {
    return NextResponse.json(
      { error: "Duplicate questions are not accepted." },
      { status: 400 },
    );
  }

  const admin = getSupabaseAdminClient();
  const questionMap = new Map(quizQuestions.map((question) => [question.id, question]));
  const score = parsed.data.answers.reduce((total, answer) => {
    const question = questionMap.get(answer.questionId);

    if (!question) {
      return total;
    }

    return total + (answer.answerIndex === question.correctIndex ? 10 : 0);
  }, 0);
  const correctAnswers = score / 10;

  const { data: player, error: playerError } = await admin
    .from("players")
    .select("*")
    .eq("id", playerId)
    .single();

  if (playerError || !player) {
    return NextResponse.json(
      {
        error: playerError?.message ?? "Player profile not found",
      },
      { status: 500 },
    );
  }

  const { data: existingScores, error: existingScoreError } = await admin
    .from("scores")
    .select("id, score")
    .eq("player_id", playerId)
    .eq("quiz_version", QUIZ_VERSION)
    .order("score", { ascending: false })
    .order("updated_at", { ascending: true })
    .limit(1);

  if (existingScoreError) {
    return NextResponse.json({ error: existingScoreError.message }, { status: 500 });
  }

  const existingScore = existingScores?.[0] ?? null;
  let bestScore = existingScore?.score ?? score;
  let updated = false;

  if (!existingScore) {
    const { error } = await admin.from("scores").insert({
      player_id: playerId,
      score,
      quiz_version: QUIZ_VERSION,
    });

    if (error) {
      if (error.code === "23505") {
        const { data: latestScores, error: latestScoreError } = await admin
          .from("scores")
          .select("id, score")
          .eq("player_id", playerId)
          .eq("quiz_version", QUIZ_VERSION)
          .order("score", { ascending: false })
          .order("updated_at", { ascending: true })
          .limit(1);

        if (latestScoreError) {
          return NextResponse.json({ error: latestScoreError.message }, { status: 500 });
        }

        const latestScore = latestScores?.[0] ?? null;

        if (latestScore && score > latestScore.score) {
          const { error: updateAfterConflictError } = await admin
            .from("scores")
            .update({ score })
            .eq("id", latestScore.id);

          if (updateAfterConflictError) {
            return NextResponse.json({ error: updateAfterConflictError.message }, { status: 500 });
          }

          bestScore = score;
          updated = true;
        } else {
          bestScore = latestScore?.score ?? score;
        }
      } else {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      bestScore = score;
      updated = true;
    }

  } else if (score > existingScore.score) {
    const { error } = await admin
      .from("scores")
      .update({
        score,
      })
      .eq("id", existingScore.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    bestScore = score;
    updated = true;
  }

  const { data: rankedEntries, error: rankError } = await admin
    .from("leaderboard_entries")
    .select("player_id")
    .eq("quiz_version", QUIZ_VERSION)
    .order("score", { ascending: false })
    .order("updated_at", { ascending: true });

  if (rankError) {
    return NextResponse.json({ error: rankError.message }, { status: 500 });
  }

  const rank = (rankedEntries ?? []).findIndex((entry) => entry.player_id === playerId) + 1;

  return NextResponse.json({
    score,
    correctAnswers,
    bestScore,
    updated,
    rank,
  });
}
