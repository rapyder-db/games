"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { toast } from "sonner";

import { BorderGlow } from "@/components/border-glow";

type AuthPanelProps = {
  onLogin?: () => void;
};

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error;
  } catch {
    return response.statusText;
  }
}

export function AuthPanel({ onLogin }: AuthPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      let response: Response;

      try {
        response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, companyName, email }),
          cache: "no-store",
        });
      } catch {
        throw new Error("Could not reach the login service. Check the event network and reload the page.");
      }
      
      if (!response.ok) {
        throw new Error((await readErrorMessage(response)) || "Registration failed");
      }
      
      toast.success("Registration saved");
      if (onLogin) {
        onLogin();
        router.refresh();
      } else {
        router.replace("/start" as Route);
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <BorderGlow
      className="home-registration-glow p-5 sm:p-8 lg:p-10"
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
      <div className="mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 mb-6">
          <span className="text-[0.65rem] font-medium text-white/80 uppercase tracking-widest">Player Login</span>
        </div>
        <h2 className="text-3xl font-semibold text-white tracking-tight sm:text-4xl lg:text-5xl">
          Enter The Arcade
        </h2>
        <p className="text-sm text-slate-400 mt-3 max-w-md font-light">
          Sign in once, claim the 3D coin, move to the cabinet, and start the challenge.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
        <label className="block">
          <span className="ml-1 mb-2 block text-xs font-medium text-slate-300 uppercase tracking-wider">Player Name</span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-glass"
            placeholder="Jane Doe"
          />
        </label>
        <label className="block">
          <span className="ml-1 mb-2 block text-xs font-medium text-slate-300 uppercase tracking-wider">Company</span>
          <input
            type="text"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="input-glass"
            placeholder="Acme Corporation"
          />
        </label>
        <label className="block">
          <span className="ml-1 mb-2 block text-xs font-medium text-slate-300 uppercase tracking-wider">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-glass"
            placeholder="jane@company.com"
          />
        </label>
        
        <div className="pt-2 sm:pt-4">
          <button type="submit" disabled={loading} className="button-glass-primary w-full shadow-brand/20">
            {loading ? "Saving..." : "Start Challenge"}
          </button>
        </div>
      </form>
    </BorderGlow>
  );
}
