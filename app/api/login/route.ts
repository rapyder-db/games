import { NextResponse } from "next/server";

import { setPlayerSession } from "@/lib/session";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";
import { profileSchema } from "@/lib/validation";
import { z } from "zod";

const loginSchema = profileSchema.extend({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = loginSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 },
      );
    }

    const { email, name, companyName } = parsed.data;
    const admin = getSupabaseAdminClient();

    // Blindly INSERT a new player profile for every login attempt
    // NO UPSERT, NO CONFLICTS. Fully frictionless and allows infinite duplicates.
    const { data: player, error } = await admin
      .from("players")
      .insert({ email, name, company_name: companyName })
      .select("id")
      .single();

    if (error || !player) {
      console.error(error);
      return NextResponse.json(
        { error: error?.message ?? "Failed to save player profile" },
        { status: 500 },
      );
    }

    await setPlayerSession(player.id);

    return NextResponse.json({ success: true, playerId: player.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
