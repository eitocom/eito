"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ensureAppUser, linkGitHubToAppUser } from "@/lib/auth/app-user";
import { shouldMockOAuth } from "@/lib/auth/mock-oauth";
import { createClient } from "@/lib/supabase/server";

async function getAppOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  if (origin) return origin;

  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://127.0.0.1:3000"
  );
}

function resolveSafeNextPath(formData?: FormData) {
  const rawNext = formData?.get("next");
  if (
    typeof rawNext === "string" &&
    rawNext.startsWith("/") &&
    !rawNext.startsWith("//")
  ) {
    return rawNext;
  }

  return "/?github=linked";
}

function githubLinkErrorPath(nextPath: string) {
  if (nextPath.startsWith("/profile")) {
    return "/profile?error=github_link";
  }

  return "/?error=github_link";
}

async function linkGitHubMock(nextPath: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await ensureAppUser(user);
  await linkGitHubToAppUser(user.id, {
    githubId: `mock-${user.id.slice(0, 8)}`,
    username: "dev-github",
    name:
      (typeof user.user_metadata?.full_name === "string" &&
        user.user_metadata.full_name) ||
      "Dev GitHub",
    avatarUrl:
      (typeof user.user_metadata?.avatar_url === "string" &&
        user.user_metadata.avatar_url) ||
      "https://api.dicebear.com/9.x/initials/svg?seed=GH",
  });

  redirect(nextPath);
}

export async function linkGitHub(formData?: FormData) {
  const nextPath = resolveSafeNextPath(formData);

  if (shouldMockOAuth("github")) {
    await linkGitHubMock(nextPath);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await ensureAppUser(user);

  if (user.identities?.some((identity) => identity.provider === "github")) {
    redirect(nextPath);
  }

  const origin = await getAppOrigin();
  const { data, error } = await supabase.auth.linkIdentity({
    provider: "github",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
    },
  });

  if (error || !data.url) {
    redirect(githubLinkErrorPath(nextPath));
  }

  redirect(data.url);
}
