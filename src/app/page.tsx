import { linkGitHub } from "@/app/account/actions";
import { signOut } from "@/app/login/actions";
import { PersistLastLogin } from "@/components/auth/persist-last-login";
import { Button } from "@/components/ui/button";
import {
  CAPABILITY_COPY,
  ensureAppUser,
  getCapabilities,
  hasGitHubConnected,
  type AppCapability,
} from "@/lib/auth/app-user";
import { shouldMockOAuth } from "@/lib/auth/mock-oauth";
import { createClient } from "@/lib/supabase/server";

const CAPABILITY_ORDER: AppCapability[] = [
  "browse",
  "claim_tasks",
  "submit_contributions",
  "create_projects",
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ github?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const appUser = user ? await ensureAppUser(user) : null;
  const githubConnected = appUser ? hasGitHubConnected(appUser) : false;
  const capabilities = appUser ? getCapabilities(appUser) : [];
  const mockGitHub = shouldMockOAuth("github");

  return (
    <main className="flex flex-1 flex-col">
      <PersistLastLogin />
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <p className="font-heading text-xl font-semibold tracking-tight">
          Eito
        </p>
        <form action={signOut}>
          <Button type="submit" variant="outline" size="sm">
            Sair
          </Button>
        </form>
      </header>

      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-6 py-16">
        <div className="space-y-3">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Bem-vindo ao mutirão
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Você entrou como{" "}
            <span className="font-medium text-foreground">
              {appUser?.name || appUser?.email || user?.email}
            </span>
            {appUser?.username ? (
              <>
                {" "}
                (@
                <span className="font-medium text-foreground">
                  {appUser.username}
                </span>
                )
              </>
            ) : null}
            .
          </p>
        </div>

        {params.github === "linked" ? (
          <p
            role="status"
            className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
          >
            GitHub conectado. Habilidades de contribuição liberadas.
          </p>
        ) : null}

        {params.error === "github_link" ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            Não foi possível conectar o GitHub. Tente novamente.
          </p>
        ) : null}

        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              Conta GitHub
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Login por e-mail ou Google já basta para entrar. Conectar o
              GitHub desbloqueia assumir tarefas, enviar PRs e criar projetos.
            </p>
          </div>

          {githubConnected ? (
            <div className="rounded-xl border border-border px-4 py-3 text-sm">
              Conectado como{" "}
              <span className="font-medium">@{appUser?.username}</span>
              {appUser?.githubId ? (
                <span className="text-muted-foreground">
                  {" "}
                  · id {appUser.githubId}
                </span>
              ) : null}
            </div>
          ) : (
            <form action={linkGitHub}>
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                Conectar GitHub
                {mockGitHub ? " (simulado)" : null}
              </Button>
            </form>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Habilidades
          </h2>
          <ul className="space-y-3">
            {CAPABILITY_ORDER.map((capability) => {
              const copy = CAPABILITY_COPY[capability];
              const unlocked = capabilities.includes(capability);

              return (
                <li
                  key={capability}
                  className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-b-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{copy.title}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {copy.description}
                    </p>
                  </div>
                  <span
                    className={
                      unlocked
                        ? "text-sm font-medium text-[oklch(0.55_0.12_145)]"
                        : "text-muted-foreground text-sm"
                    }
                  >
                    {unlocked ? "Liberada" : "Requer GitHub"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </main>
  );
}
