import Link from "next/link";

import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { ensureAppUser } from "@/lib/auth/app-user";
import { createClient } from "@/lib/supabase/server";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const appUser = user ? await ensureAppUser(user) : null;

  return (
    <header className="border-border bg-background/90 sticky top-0 z-40 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="font-heading text-xl font-semibold tracking-tight transition-opacity hover:opacity-80"
        >
          Eito
        </Link>

        <nav aria-label="Conta" className="flex items-center gap-2">
          {appUser ? (
            <UserMenu
              user={{
                name: appUser.name,
                email: appUser.email,
                username: appUser.username,
                avatarUrl: appUser.avatarUrl,
              }}
            />
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Entrar</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
