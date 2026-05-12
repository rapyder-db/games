import { ArcadeLobby } from "@/components/arcade-lobby";
import { AuthPanel } from "@/components/auth-panel";
import { BorderGlow } from "@/components/border-glow";
import { getPlayerSession } from "@/lib/session";
import { getSupabaseAdminClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const playerId = await getPlayerSession();
  let player = null;

  if (playerId) {
    const admin = getSupabaseAdminClient();
    const { data } = await admin
      .from("players")
      .select("id, name, company_name")
      .eq("id", playerId)
      .maybeSingle();

    if (data) {
      player = data;
    }
  }

  return (
    <div className="animate-fade-in relative z-10">
      {player ? (
        <ArcadeLobby player={player} />
      ) : (
        <div className="grid gap-5 px-3 py-2 sm:gap-6 sm:px-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:px-0">
          <BorderGlow
            className="home-registration-glow min-h-[220px] p-5 sm:min-h-[280px] sm:p-8 lg:p-14"
            edgeSensitivity={28}
            glowColor="2 97 59"
            backgroundColor="#050202"
            borderRadius={28}
            glowRadius={34}
            glowIntensity={0.9}
            coneSpread={24}
            animated
            colors={["#fc3030", "#ffb000", "#ffffff"]}
          >
            <section className="flex h-full flex-col justify-center">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Welcome to Rapyder Arcade
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                Register once, enter the arcade, and play for the live leaderboard.
              </p>

              <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/40 shadow-[0_20px_60px_rgba(0,0,0,0.45)] sm:mt-8">
                <div className="flex items-center justify-between border-b border-white/10 bg-black/30 px-4 py-3">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-white/55">
                    Reward Preview
                  </span>
                  <span className="text-[0.65rem] font-mono uppercase tracking-[0.2em] text-[#ffb000]/70">
                    Smartwatch 3D
                  </span>
                </div>

                <div className="relative aspect-[4/5] w-full bg-[radial-gradient(circle_at_top,rgba(252,48,48,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(0,0,0,0.35)),#020202] sm:aspect-[16/10]">
                  <video
                    className="h-full w-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                  >
                    <source src="/Smartwatch 3d.mp4" type="video/mp4" />
                  </video>
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.18)_100%)]" />
                </div>
              </div>
            </section>
          </BorderGlow>

          <AuthPanel />
        </div>
      )}
    </div>
  );
}
