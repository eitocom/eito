"use client";

import { useEffect } from "react";

import { setLastLogin, type LastLoginMethod } from "@/lib/auth/last-login";
import { createClient } from "@/lib/supabase/client";

function resolveMethod(provider: unknown): LastLoginMethod {
  if (provider === "github" || provider === "google") return provider;
  return "email";
}

export function PersistLastLogin() {
  useEffect(() => {
    const supabase = createClient();

    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      const metadata = user.user_metadata ?? {};
      const name =
        (typeof metadata.full_name === "string" && metadata.full_name) ||
        (typeof metadata.name === "string" && metadata.name) ||
        undefined;
      const avatarUrl =
        typeof metadata.avatar_url === "string"
          ? metadata.avatar_url
          : undefined;

      setLastLogin({
        method: resolveMethod(user.app_metadata?.provider),
        email: user.email ?? undefined,
        name,
        avatarUrl,
      });
    });
  }, []);

  return null;
}
