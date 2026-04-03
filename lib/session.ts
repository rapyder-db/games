import { cookies } from "next/headers";

const SESSION_COOKIE = "game_session_id";

export async function setPlayerSession(playerId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, playerId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function getPlayerSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return session?.value ?? null;
}

export async function clearPlayerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
