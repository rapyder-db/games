"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getSupabaseBrowserClient } from "@/lib/supabaseClient";

type AuthPanelProps = {
  initialEmail: string | null;
};

export function AuthPanel({ initialEmail }: AuthPanelProps) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [email, setEmail] = useState(initialEmail ?? "");
  const [userEmail, setUserEmail] = useState(initialEmail);
  const [loading, setLoading] = useState<"magic" | "google" | "signout" | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  async function handleMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading("magic");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Magic link sent. Check your inbox.");
  }

  async function handleGoogleLogin() {
    setLoading("google");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setLoading(null);
      toast.error(error.message);
    }
  }

  async function handleSignOut() {
    setLoading("signout");
    const { error } = await supabase.auth.signOut();
    setLoading(null);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Signed out");
    router.refresh();
  }

  if (userEmail) {
    return (
      <div className="panel p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Signed in</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-[var(--font-heading)] text-2xl font-semibold">{userEmail}</p>
            <p className="mt-1 text-sm text-slate-600">
              Your session is active. Head to the quiz and submit your best score.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={loading === "signout"}
            className="button-secondary"
          >
            {loading === "signout" ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel p-6">
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Sign in to play</p>
        <h2 className="mt-2 font-[var(--font-heading)] text-2xl font-semibold">
          Use Magic Link or Google
        </h2>
      </div>

      <form onSubmit={handleMagicLink} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          className="input"
          required
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="submit" disabled={loading !== null} className="button-primary flex-1">
            {loading === "magic" ? "Sending..." : "Send Magic Link"}
          </button>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading !== null}
            className="button-secondary flex-1"
          >
            {loading === "google" ? "Redirecting..." : "Continue with Google"}
          </button>
        </div>
      </form>
    </div>
  );
}
