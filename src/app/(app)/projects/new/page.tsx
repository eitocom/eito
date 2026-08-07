import Link from "next/link";

import { linkGitHub } from "@/app/account/actions";
import { NewProjectForm } from "@/app/(app)/projects/new/new-project-form";
import { Button } from "@/components/ui/button";
import { can, ensureAppUser, hasGitHubConnected } from "@/lib/auth/app-user";
import { shouldMockOAuth } from "@/lib/auth/mock-oauth";
import { createClient } from "@/lib/supabase/server";

export default async function NewProjectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const appUser = user ? await ensureAppUser(user) : null;
  const canCreate =
    appUser != null &&
    hasGitHubConnected(appUser) &&
    can(appUser, "create_projects");
  const mockGitHub = shouldMockOAuth("github");

  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm">
            <Link href="/" className="hover:text-foreground transition-colors">
              Início
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="text-foreground">Novo projeto</span>
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Cadastrar projeto
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Publique um repositório no mutirão para abrir tarefas com bounty e
            receber contribuições da comunidade.
          </p>
        </div>

        {canCreate ? (
          <NewProjectForm />
        ) : (
          <div className="space-y-6">
            <p
              role="status"
              className="border-border bg-muted/40 rounded-lg border px-4 py-3 text-sm leading-relaxed"
            >
              Para criar projetos você precisa conectar o GitHub. Isso libera a
              habilidade de publicar repositórios e abrir tarefas no Eito.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <form action={linkGitHub}>
                <Button type="submit" size="lg">
                  Conectar GitHub
                  {mockGitHub ? " (simulado)" : null}
                </Button>
              </form>
              <Button asChild variant="outline" size="lg">
                <Link href="/">Voltar ao início</Link>
              </Button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
