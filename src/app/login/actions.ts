"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  MOCK_OAUTH_USERS,
  shouldMockOAuth,
  type OAuthProvider,
} from "@/lib/auth/mock-oauth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  success?: string;
};

export type { OAuthProvider };

async function getAppOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  if (origin) return origin;

  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://127.0.0.1:3000"
  );
}

export async function signIn(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "E-mail ou senha inválidos." };
  }

  redirect("/");
}

export async function signUp(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

async function signInWithMockOAuth(provider: OAuthProvider) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    redirect("/login?error=oauth");
  }

  const profile = MOCK_OAUTH_USERS[provider];
  let admin;

  try {
    admin = createAdminClient();
  } catch {
    redirect("/login?error=oauth");
  }

  const { data: listed, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (listError) {
    redirect("/login?error=oauth");
  }

  const existing = listed.users.find((user) => user.email === profile.email);

  if (existing) {
    const { error: updateError } = await admin.auth.admin.updateUserById(
      existing.id,
      {
        password: profile.password,
        email_confirm: true,
        user_metadata: {
          full_name: profile.fullName,
          name: profile.fullName,
          avatar_url: profile.avatarUrl,
        },
        app_metadata: {
          provider,
          providers: [provider],
        },
      },
    );

    if (updateError) {
      redirect("/login?error=oauth");
    }
  } else {
    const { error: createError } = await admin.auth.admin.createUser({
      email: profile.email,
      password: profile.password,
      email_confirm: true,
      user_metadata: {
        full_name: profile.fullName,
        name: profile.fullName,
        avatar_url: profile.avatarUrl,
      },
      app_metadata: {
        provider,
        providers: [provider],
      },
    });

    if (createError) {
      redirect("/login?error=oauth");
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: profile.password,
  });

  if (error) {
    redirect("/login?error=oauth");
  }

  redirect("/");
}

export async function signInWithOAuth(provider: OAuthProvider) {
  if (shouldMockOAuth(provider)) {
    await signInWithMockOAuth(provider);
  }

  const supabase = await createClient();
  const origin = await getAppOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth");
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
