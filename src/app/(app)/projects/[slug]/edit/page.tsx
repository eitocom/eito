import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { EditProjectForm } from "@/app/(app)/projects/[slug]/edit/edit-project-form";
import { ensureAppUser } from "@/lib/auth/app-user";
import { getProjectBySlug } from "@/lib/projects/queries";
import { createClient } from "@/lib/supabase/server";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const appUser = await ensureAppUser(user);

  if (appUser.id !== project.ownerId) {
    redirect(`/projects/${project.slug}`);
  }

  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm">
            <Link href="/" className="hover:text-foreground transition-colors">
              Início
            </Link>
            <span aria-hidden="true"> / </span>
            <Link
              href="/projects"
              className="hover:text-foreground transition-colors"
            >
              Projetos
            </Link>
            <span aria-hidden="true"> / </span>
            <Link
              href={`/projects/${project.slug}`}
              className="hover:text-foreground transition-colors"
            >
              {project.title}
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="text-foreground">Editar</span>
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Editar projeto
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Atualize as informações públicas do repositório no mutirão.
          </p>
        </div>

        <EditProjectForm
          slug={project.slug}
          initialValues={{
            title: project.title,
            description: project.description,
            githubRepoUrl: project.githubRepoUrl,
          }}
        />
      </section>
    </main>
  );
}
