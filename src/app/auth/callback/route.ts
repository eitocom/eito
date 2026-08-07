import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  resolveRequestOrigin,
  resolveSafeNextPath,
} from "@/lib/auth/app-origin";
import { ensureAppUser } from "@/lib/auth/app-user";

const USER_SYNC_TIMEOUT_MS = 4_000;

async function syncAppUserWithTimeout(
  supabase: ReturnType<typeof createServerClient>,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await Promise.race([
    ensureAppUser(user),
    new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error("ensureAppUser timed out")),
        USER_SYNC_TIMEOUT_MS,
      );
    }),
  ]);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = resolveSafeNextPath(searchParams.get("next"));
  const origin = resolveRequestOrigin(request);

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const redirectResponse = NextResponse.redirect(`${origin}${next}`);

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              redirectResponse.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("exchangeCodeForSession failed", error.message);
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }

    try {
      await syncAppUserWithTimeout(supabase);
    } catch (syncError) {
      // Session cookies are already on redirectResponse — do not block login
      // if Prisma cannot reach Postgres (common with direct db.* on Vercel).
      console.error("ensureAppUser after OAuth failed", syncError);
    }

    return redirectResponse;
  } catch (error) {
    console.error("auth callback failed", error);
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }
}
