import Link from "next/link";
import { redirect } from "next/navigation";

import { linkGitHub } from "@/app/account/actions";
import { PixKeyForm } from "@/app/(app)/profile/pix-key-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ensureAppUser, hasGitHubConnected } from "@/lib/auth/app-user";
import { shouldMockOAuth } from "@/lib/auth/mock-oauth";
import { createClient } from "@/lib/supabase/server";

function avatarInitial(name: string | null, username: string, email: string) {
  const source = name || username || email;
  return source.charAt(0).toUpperCase();
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ github?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const appUser = await ensureAppUser(user);
  const githubConnected = hasGitHubConnected(appUser);
  const mockGitHub = shouldMockOAuth("github");
  const displayName = appUser.name || appUser.username || appUser.email;

  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm">
            <Link href="/" className="hover:text-foreground transition-colors">
              Início
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="text-foreground">Perfil</span>
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Perfil
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Gerencie sua identidade no mutirão e a chave PIX para receber
            bounties.
          </p>
        </div>

        {params.github === "linked" ? (
          <p
            role="status"
            className="border-border bg-muted/40 rounded-lg border px-3 py-2 text-sm"
          >
            GitHub conectado. Seu perfil foi atualizado.
          </p>
        ) : null}

        {params.error === "github_link" ? (
          <p
            role="alert"
            className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm"
          >
            Não foi possível conectar o GitHub. Tente novamente.
          </p>
        ) : null}

        <div className="border-border flex items-start gap-4 border-b pb-8">
          <Avatar size="lg">
            {appUser.avatarUrl ? (
              <AvatarImage src={appUser.avatarUrl} alt="" />
            ) : null}
            <AvatarFallback className="bg-[oklch(0.78_0.12_130/0.25)] text-lg font-semibold text-[oklch(0.45_0.1_145)]">
              {avatarInitial(appUser.name, appUser.username, appUser.email)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 space-y-1">
            <p className="font-heading truncate text-xl font-semibold tracking-tight">
              {displayName}
            </p>
            {appUser.username ? (
              <p className="text-muted-foreground truncate text-sm">
                @{appUser.username}
              </p>
            ) : null}
            <p className="text-muted-foreground truncate text-sm">
              {appUser.email}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              Conta GitHub
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Conectar o GitHub desbloqueia contribuições e criação de projetos.
            </p>
          </div>

          {githubConnected ? (
            <div className="border-border rounded-xl border px-4 py-3 text-sm">
              Conectado como{" "}
              <span className="font-medium">@{appUser.username}</span>
              {appUser.githubId ? (
                <span className="text-muted-foreground">
                  {" "}
                  · id {appUser.githubId}
                </span>
              ) : null}
            </div>
          ) : (
            <div className="space-y-4">
              <p
                role="status"
                className="border-border bg-muted/40 rounded-lg border px-4 py-3 text-sm leading-relaxed"
              >
                Seu GitHub ainda não está conectado. Sem isso, você pode
                explorar o mutirão, mas não assume tarefas nem cria projetos.
              </p>
              <form action={linkGitHub}>
                <input
                  type="hidden"
                  name="next"
                  value="/profile?github=linked"
                />
                <Button type="submit" size="lg">
                  Conectar GitHub
                  {mockGitHub ? " (simulado)" : null}
                </Button>
              </form>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              Pagamento
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Cadastre a chave PIX que será usada para receber recompensas.
            </p>
          </div>
          <PixKeyForm initialPixKey={appUser.pixKey} />
        </div>
      </section>
    </main>
  );
}
