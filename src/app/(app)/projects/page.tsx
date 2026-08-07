import Link from "next/link";

import { ProjectCard } from "@/components/projects/project-card";
import { Button } from "@/components/ui/button";
import { can, ensureAppUser, hasGitHubConnected } from "@/lib/auth/app-user";
import { listProjects } from "@/lib/projects/list-projects";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ mine?: string }>;
}) {
  const params = await searchParams;
  const mineOnly = params.mine === "1";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const appUser = user ? await ensureAppUser(user) : null;
  const canCreate =
    appUser != null &&
    hasGitHubConnected(appUser) &&
    can(appUser, "create_projects");

  const projects = await listProjects(
    mineOnly && appUser ? { ownerId: appUser.id } : undefined,
  );

  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">
              <Link
                href="/"
                className="hover:text-foreground transition-colors"
              >
                Início
              </Link>
              <span aria-hidden="true"> / </span>
              <span className="text-foreground">Projetos</span>
            </p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              Projetos
            </h1>
            <p className="text-muted-foreground max-w-2xl leading-relaxed">
              Explore repositórios do mutirão, veja bounties abertas e entre no
              detalhe de cada projeto.
            </p>
          </div>

          {canCreate ? (
            <Button asChild size="lg">
              <Link href="/projects/new">Novo projeto</Link>
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant={mineOnly ? "outline" : "default"}>
            <Link href="/projects">Todos</Link>
          </Button>
          <Button asChild size="sm" variant={mineOnly ? "default" : "outline"}>
            <Link href="/projects?mine=1">Meus projetos</Link>
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="border-border bg-muted/40 space-y-4 rounded-xl border px-6 py-10 text-center">
            <p className="text-sm leading-relaxed">
              {mineOnly
                ? "Você ainda não cadastrou projetos."
                : "Nenhum projeto publicado no mutirão ainda."}
            </p>
            {canCreate ? (
              <Button asChild>
                <Link href="/projects/new">Cadastrar primeiro projeto</Link>
              </Button>
            ) : (
              <p className="text-muted-foreground text-sm">
                Conecte o GitHub no{" "}
                <Link href="/profile" className="text-foreground underline">
                  perfil
                </Link>{" "}
                para publicar um repositório.
              </p>
            )}
          </div>
        ) : (
          <ul className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3")}>
            {projects.map((project) => (
              <li key={project.id}>
                <ProjectCard
                  title={project.title}
                  description={project.description}
                  owner={project.owner}
                  stats={project.stats}
                  githubRepoUrl={project.githubRepoUrl}
                  href={`/projects/${project.slug}`}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
