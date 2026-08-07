"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  ensureAppUser,
  linkGitHubToAppUser,
} from "@/lib/auth/app-user";
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

async function linkGitHubMock() {
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

  redirect("/?github=linked");
}

export async function linkGitHub() {
  if (shouldMockOAuth("github")) {
    await linkGitHubMock();
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
    redirect("/?github=linked");
  }

  const origin = await getAppOrigin();
  const { data, error } = await supabase.auth.linkIdentity({
    provider: "github",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/?github=linked")}`,
    },
  });

  if (error || !data.url) {
    redirect("/?error=github_link");
  }

  redirect(data.url);
}
