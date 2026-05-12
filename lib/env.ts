export class MissingEnvironmentVariableError extends Error {
  readonly names: string[];

  constructor(names: string[]) {
    super(`Missing environment variable. Expected: ${names.join(" or ")}`);
    this.name = "MissingEnvironmentVariableError";
    this.names = names;
  }
}

export function isMissingEnvironmentVariableError(
  error: unknown,
): error is MissingEnvironmentVariableError {
  return error instanceof MissingEnvironmentVariableError;
}

function getEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new MissingEnvironmentVariableError([name]);
  }

  return value;
}

function getEnvFrom(names: string[]) {
  for (const name of names) {
    const value = process.env[name];

    if (value) {
      return value;
    }
  }

  throw new MissingEnvironmentVariableError(names);
}

export const env = {
  get supabaseUrl() {
    return getEnv("NEXT_PUBLIC_SUPABASE_URL");
  },
  get supabaseAnonKey() {
    return getEnvFrom([
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ]);
  },
  get supabaseServiceRoleKey() {
    return getEnvFrom([
      "SUPABASE_SECRET_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
    ]);
  },
};
