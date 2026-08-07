export type OAuthProvider = "google" | "github";

const MOCK_PASSWORD = "dev-oauth-password";

export const MOCK_OAUTH_USERS: Record<
  OAuthProvider,
  {
    email: string;
    fullName: string;
    avatarUrl: string;
    password: string;
  }
> = {
  github: {
    email: "dev.github@eito.local",
    fullName: "Dev GitHub",
    avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=GH",
    password: MOCK_PASSWORD,
  },
  google: {
    email: "dev.google@eito.local",
    fullName: "Dev Google",
    avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=GG",
    password: MOCK_PASSWORD,
  },
};

function clientIdFor(provider: OAuthProvider) {
  return provider === "github"
    ? process.env.GITHUB_CLIENT_ID
    : process.env.GOOGLE_CLIENT_ID;
}

export function shouldMockOAuth(provider: OAuthProvider) {
  if (process.env.NODE_ENV === "production") return false;
  return !clientIdFor(provider)?.trim();
}

export function getMockOAuthFlags() {
  return {
    github: shouldMockOAuth("github"),
    google: shouldMockOAuth("google"),
  };
}
