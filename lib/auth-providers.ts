import { authConfig } from "./auth-config";

export const OAUTH_PROVIDERS = {
  google: "google",
  linkedin: "linkedin_oidc",
} as const;

export type OAuthProvider = keyof typeof OAUTH_PROVIDERS;

// Which social logins are switched on in the Supabase dashboard.
export async function enabledProviders(): Promise<Record<OAuthProvider, boolean>> {
  const off = { google: false, linkedin: false };
  const config = authConfig();

  if (!config) {
    return off;
  }

  try {
    const response = await fetch(`${config.url}/auth/v1/settings`, {
      headers: { apikey: config.key },
    });

    if (!response.ok) {
      return off;
    }

    const { external } = (await response.json()) as {
      external?: Record<string, boolean>;
    };

    return {
      google: !!external?.[OAUTH_PROVIDERS.google],
      linkedin: !!external?.[OAUTH_PROVIDERS.linkedin],
    };
  } catch {
    return off;
  }
}
