import type { User as AuthUser } from "@supabase/supabase-js";

export const REQUIRED_GITHUB_SCOPES = ["repo", "user:email", "read:user"];

export function getGitHubProviderToken(authUser: AuthUser): string | null {
  const providerToken = (authUser as unknown as Record<string, unknown>).provider_token;
  if (typeof providerToken === "string" && providerToken.length > 0) {
    return providerToken;
  }
  return null;
}
