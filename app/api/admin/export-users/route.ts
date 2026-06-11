import { isAdminProfile } from "@/lib/admin";
import { QUIZ_QUESTION_COUNT, QUIZ_VERSION } from "@/lib/quizQuestions";
import { getPlayerSession } from "@/lib/session";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

type PlayerExportRow = {
  id: string;
  name: string;
  company_name: string;
  email: string;
  created_at: string;
};

type ScoreExportRow = {
  player_id: string;
  score: number;
  quiz_version: string;
  updated_at: string;
};

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatScore(score: number | null | undefined) {
  if (typeof score !== "number") {
    return "";
  }

  return `${Math.round(score / 10)}/${QUIZ_QUESTION_COUNT}`;
}

function buildExcelHtml(players: PlayerExportRow[], scores: Map<string, ScoreExportRow>) {
  const rows = players
    .map((player, index) => {
      const score = scores.get(player.id);

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(player.name)}</td>
          <td>${escapeHtml(player.company_name)}</td>
          <td>${escapeHtml(player.email)}</td>
          <td>${escapeHtml(formatScore(score?.score))}</td>
          <td>${escapeHtml(score?.score ?? "")}</td>
          <td>${escapeHtml(score?.quiz_version ?? QUIZ_VERSION)}</td>
          <td>${escapeHtml(score?.updated_at ?? "")}</td>
          <td>${escapeHtml(player.created_at)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          table { border-collapse: collapse; font-family: Arial, sans-serif; }
          th, td { border: 1px solid #999; padding: 8px 10px; text-align: left; }
          th { background: #fc3030; color: #fff; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Company</th>
              <th>Email</th>
              <th>Score</th>
              <th>Raw Score</th>
              <th>Quiz Version</th>
              <th>Score Saved At</th>
              <th>Registered At</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `.trim();
}

export async function GET() {
  const playerId = await getPlayerSession();

  if (!playerId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  const { data: adminPlayer, error: adminPlayerError } = await supabase
    .from("players")
    .select("name, company_name, email")
    .eq("id", playerId)
    .maybeSingle();

  if (adminPlayerError) {
    return new Response(adminPlayerError.message, { status: 500 });
  }

  if (!isAdminProfile(adminPlayer)) {
    return new Response("Forbidden", { status: 403 });
  }

  const [{ data: players, error: playersError }, { data: scoreRows, error: scoresError }] =
    await Promise.all([
      supabase
        .from("players")
        .select("id, name, company_name, email, created_at")
        .order("created_at", { ascending: true }),
      supabase
        .from("scores")
        .select("player_id, score, quiz_version, updated_at")
        .eq("quiz_version", QUIZ_VERSION)
        .order("score", { ascending: false })
        .order("updated_at", { ascending: true }),
    ]);

  if (playersError) {
    return new Response(playersError.message, { status: 500 });
  }

  if (scoresError) {
    return new Response(scoresError.message, { status: 500 });
  }

  const bestScores = new Map<string, ScoreExportRow>();

  ((scoreRows ?? []) as ScoreExportRow[]).forEach((score) => {
    if (!bestScores.has(score.player_id)) {
      bestScores.set(score.player_id, score);
    }
  });

  const today = new Date().toISOString().slice(0, 10);
  const fileName = `rapyder-arcade-users-${QUIZ_VERSION}-${today}.xls`;
  const html = buildExcelHtml((players ?? []) as PlayerExportRow[], bestScores);

  return new Response(`\uFEFF${html}`, {
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
