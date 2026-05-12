import { NextResponse } from "next/server";

import { isMissingEnvironmentVariableError } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("leaderboard_entries")
      .select("player_id", { count: "exact", head: true });

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          checks: {
            supabaseEnv: "ok",
            database: "failed",
          },
          error: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      checks: {
        supabaseEnv: "ok",
        database: "ok",
      },
    });
  } catch (error) {
    if (isMissingEnvironmentVariableError(error)) {
      return NextResponse.json(
        {
          ok: false,
          checks: {
            supabaseEnv: "failed",
            database: "skipped",
          },
          error: `Missing: ${error.names.join(" or ")}`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        checks: {
          supabaseEnv: "unknown",
          database: "unknown",
        },
        error: error instanceof Error ? error.message : "Unknown health check error",
      },
      { status: 500 },
    );
  }
}
