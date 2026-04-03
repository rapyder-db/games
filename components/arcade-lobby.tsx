"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ArcadeLobbyProps = {
  player: {
    id: string;
    name: string;
    company_name: string;
  };
};

type LobbyStage = "cabinet" | "inserting";

export function ArcadeLobby({ player }: ArcadeLobbyProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<LobbyStage>("cabinet");
  const [booted, setBooted] = useState(true);
  const [muted, setMuted] = useState(false);
  const [hudMessage, setHudMessage] = useState("");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [shaking, setShaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const storageKey = useMemo(() => `arcade_lobby_stage:${player.id}`, [player.id]);

  useEffect(() => {
    const savedStage = window.sessionStorage.getItem(storageKey);

    if (savedStage === "inserting") {
      setStage("cabinet");
      setBooted(true);
    }
  }, [storageKey]);

  useEffect(() => {
    const savedMute = window.localStorage.getItem("arcade_sound_muted");
    setMuted(savedMute === "true");
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem(storageKey, stage);
  }, [stage, storageKey]);

  const getAudioContext = () => {
    if (audioContextRef.current) {
      return audioContextRef.current;
    }

    if (typeof window === "undefined") {
      return null;
    }

    const context = new window.AudioContext();
    audioContextRef.current = context;
    return context;
  };

  const playSfx = (type: "button" | "coin" | "success" | "tick") => {
    if (muted) {
      return;
    }

    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case "button":
        osc.type = "square";
        osc.frequency.setValueAtTime(680, now);
        gain.gain.setTargetAtTime(0.025, now, 0.015);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      case "coin":
        osc.type = "triangle";
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(560, now + 0.15);
        gain.gain.setTargetAtTime(0.16, now, 0.015);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      case "tick":
        osc.type = "square";
        osc.frequency.setValueAtTime(860, now);
        gain.gain.setTargetAtTime(0.15, now, 0.008);
        osc.start(now);
        osc.stop(now + 0.06);
        break;
      case "success":
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
        gain.gain.setTargetAtTime(0.22, now, 0.02);
        osc.start(now);
        osc.stop(now + 0.28);
        break;
    }
  };

  useEffect(() => {
    if (stage !== "inserting") {
      setHudMessage("");
      setCountdown(null);
      setShaking(false);
      return;
    }

    let timer = 3;
    setHudMessage(`Coin accepted! Launch in ${timer}...`);
    setCountdown(timer);
    playSfx("coin");

    const tickInterval = window.setInterval(() => {
      timer -= 1;

      if (timer > 0) {
        setHudMessage(`Coin accepted! Launch in ${timer}...`);
        setCountdown(timer);
        playSfx("tick");
      } else {
        setHudMessage("Coin accepted! Ready...");
        setCountdown(0);
        setShaking(true);
        playSfx("success");

        window.setTimeout(() => {
          setShaking(false);
        }, 380);

        window.clearInterval(tickInterval);
      }
    }, 700);

    const bootTimer = window.setTimeout(() => {
      toast.success("Coin accepted. Booting challenge cabinet.");
      setBooted(true);
    }, 1200);

    const routeTimer = window.setTimeout(() => {
      router.push("/quiz");
      router.refresh();
    }, 2400);

    return () => {
      window.clearInterval(tickInterval);
      window.clearTimeout(bootTimer);
      window.clearTimeout(routeTimer);
    };
  }, [router, stage, muted]);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/logout", { method: "POST" });
    setLoading(false);
    router.refresh();
    toast.success("Session terminated");
  }

  function handleInsertCoin() {
    if (stage === "inserting") {
      return;
    }

    playSfx("button");
    setStage("inserting");
  }

  return (
    <section className="arcade-start-view">
      <div className="arcade-floating-controls">
        <div className="arcade-player-pill">
          <span>{player.name}</span>
          <span className="text-white/35">/</span>
          <span>{player.company_name}</span>
        </div>

        <button
          type="button"
          onClick={() => {
            const next = !muted;
            setMuted(next);
            window.localStorage.setItem("arcade_sound_muted", String(next));
            playSfx("button");
          }}
          className="pinball-bumper arcade-sound-toggle group text-xs"
        >
          <div className="rounded-[12px] border-b-2 border-[#666] bg-[#111] px-3 py-2">
            <span className="font-mono text-sm tracking-widest text-[#fff]">
              {muted ? "SOUND OFF" : "SOUND ON"}
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          className="button-glass-secondary"
        >
          {loading ? "Terminating..." : "Exit"}
        </button>
      </div>

      <div className="arcade-start-stage arcade-machine-layout">
        <div className={`arcade-stage ${booted ? "arcade-stage-booted" : ""} ${shaking ? "arcade-stage-shake" : ""}`}>
          {hudMessage && (
            <div className="arcade-hud-mini">
              <span>{hudMessage}</span>
            </div>
          )}

          <div className="arcade-coin-shot-wrap">
            <Image
              src="/Coin.png"
              alt="Rapyder game coin"
              width={200}
              height={200}
              className={
                stage === "inserting"
                  ? "arcade-coin-insert arcade-coin-glitter arcade-coin-spin"
                  : "arcade-coin-idle"
              }
              priority
            />
          </div>

          <Image
            src="/Arcade.png"
            alt="Arcade machine"
            width={1300}
            height={1300}
            className="arcade-cabinet-image arcade-cabinet-full"
            priority
          />

          <div className="arcade-stage-action">
            <button
              type="button"
              onClick={handleInsertCoin}
              disabled={stage === "inserting"}
              className="button-glass-primary w-full sm:w-auto"
            >
              {stage === "inserting" ? "Starting Quiz..." : "Insert Coin"}
            </button>
          </div>

          <div className="arcade-energy-grid" />
        </div>
      </div>
    </section>
  );
}
