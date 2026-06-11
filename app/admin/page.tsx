import { redirect } from "next/navigation";

import { isAdminProfile } from "@/lib/admin";
import { getPlayerSession } from "@/lib/session";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const playerId = await getPlayerSession();

  if (!playerId) {
    redirect("/");
  }

  const supabase = getSupabaseAdminClient();
  const { data: player } = await supabase
    .from("players")
    .select("name, company_name, email")
    .eq("id", playerId)
    .maybeSingle();

  if (!isAdminProfile(player)) {
    redirect("/");
  }

  return (
    <section className="panel-glass mx-auto max-w-3xl p-5 sm:p-8 lg:p-10">
      <div className="dot-matrix-screen px-4 py-5 sm:px-6 sm:py-6">
        <p className="dot-matrix-text-red mb-3 text-sm sm:text-lg">ADMIN ACCESS</p>
        <h1 className="dot-matrix-text text-3xl sm:text-5xl">EXPORT DATA</h1>
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-black/40 p-5 sm:p-6">
        <p className="text-sm leading-6 text-white/75">
          Download the current quiz participant export with player name, company,
          email, score, quiz version, and score timestamp.
        </p>

        <a
          href="/api/admin/export-users"
          className="button-glass-primary mt-6 w-full sm:w-auto"
        >
          Download Excel File
        </a>
      </div>
    </section>
  );
}
