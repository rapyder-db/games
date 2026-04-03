import { redirect } from "next/navigation";

import { ArcadeLobby } from "@/components/arcade-lobby";
import { getPlayerSession } from "@/lib/session";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function StartPage() {
  const playerId = await getPlayerSession();

  if (!playerId) {
    redirect("/");
  }

  const admin = getSupabaseAdminClient();
  const { data: player } = await admin
    .from("players")
    .select("id, name, company_name")
    .eq("id", playerId)
    .maybeSingle();

  if (!player) {
    redirect("/");
  }

  return <ArcadeLobby player={player} />;
}
