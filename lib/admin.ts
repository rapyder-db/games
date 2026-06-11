import type { PlayerProfile } from "@/lib/types";

export const ADMIN_IDENTITY = {
  name: "syed",
  companyName: "rapyder",
  email: "syed.nazeer@rapyder.com",
} as const;

type AdminProfile = Pick<PlayerProfile, "name" | "company_name" | "email">;

function normalizeIdentityValue(value: string) {
  return value.trim().toLowerCase();
}

export function isAdminProfile(profile: AdminProfile | null | undefined) {
  if (!profile) {
    return false;
  }

  return (
    normalizeIdentityValue(profile.name) === ADMIN_IDENTITY.name &&
    normalizeIdentityValue(profile.company_name) === ADMIN_IDENTITY.companyName &&
    normalizeIdentityValue(profile.email) === ADMIN_IDENTITY.email
  );
}
