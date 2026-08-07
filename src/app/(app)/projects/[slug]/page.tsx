import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";

import { ProjectOwnerActions } from "@/components/projects/project-owner-actions";
import {
  KANBAN_COLUMN_STATUSES,
  ProjectKanbanBoard,
  type KanbanColumnStatus,
} from "@/components/projects/project-kanban-board";
import { TaskBountyCard } from "@/components/projects/task-bounty-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ensureAppUser } from "@/lib/auth/app-user";
import { getProjectBySlug } from "@/lib/projects/queries";
import { createClient } from "@/lib/supabase/server";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

function ownerInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export default async function ProjectDetailPage({
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
  const appUser = user ? await ensureAppUser(user) : null;
  const isOwner = appUser?.id === project.ownerId;

  const childrenByStatus = Object.fromEntries(
    KANBAN_COLUMN_STATUSES.map((status) => {
      const tasks = project.tasks.filter((task) => task.status === status);
      if (tasks.length === 0) return [status, null];

      return [
        status,
        tasks.map((task) => (
          <TaskBountyCard
            key={task.id}
            title={task.title}
            amountBrl={task.amountBrl}
            githubIssueUrl={task.githubIssueUrl}
            href={`/projects/${project.slug}/tasks/${task.id}`}
            assignee={
              task.assignee
                ? {
                    name: task.assignee.name,
                    avatarUrl: task.assignee.avatarUrl,
                  }
                : null
            }
          />
        )),
      ];
    }),
  ) as Partial<Record<KanbanColumnStatus, ReactNode>>;

  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-16">
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
            <span className="text-foreground">{project.title}</span>
          </p>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-4">
              <h1 className="font-heading text-3xl font-semibold tracking-tight">
                {project.title}
              </h1>
              <p className="text-muted-foreground max-w-3xl leading-relaxed">
                {project.description}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Avatar size="sm">
                    {project.owner.avatarUrl ? (
                      <AvatarImage src={project.owner.avatarUrl} alt="" />
                    ) : null}
                    <AvatarFallback className="bg-[oklch(0.78_0.12_130/0.25)] font-semibold text-[oklch(0.45_0.1_145)]">
                      {ownerInitial(project.owner.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {project.owner.name}
                  </span>
                </div>
                <Badge variant="secondary">
                  {project.stats.openBounties}{" "}
                  {project.stats.openBounties === 1
                    ? "bounty aberta"
                    : "bounties abertas"}
                </Badge>
                <Badge variant="outline">
                  {currencyFormatter.format(project.stats.totalBountyValue)}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <a
                  href={project.githubRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Repositório
                  <ExternalLink data-icon="inline-end" />
                </a>
              </Button>
              {isOwner ? (
                <Button asChild variant="outline">
                  <Link href={`/projects/${project.slug}/edit`}>Editar</Link>
                </Button>
              ) : null}
              <ProjectOwnerActions
                projectId={project.id}
                canCreateTask={isOwner}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Quadro de tarefas
          </h2>
          <ProjectKanbanBoard childrenByStatus={childrenByStatus} />
        </div>
      </section>
    </main>
  );
}
