import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { TaskStatusActions } from "@/components/projects/task-status-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ensureAppUser } from "@/lib/auth/app-user";
import { getTaskById } from "@/lib/tasks/get-task";
import { createClient } from "@/lib/supabase/server";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const statusLabels: Record<string, string> = {
  OPEN: "Aberta",
  IN_PROGRESS: "Em andamento",
  UNDER_REVIEW: "Em revisão",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};

function personInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ slug: string; taskId: string }>;
}) {
  const { slug, taskId } = await params;
  const task = await getTaskById(taskId);

  if (!task || task.project.slug !== slug) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const appUser = user ? await ensureAppUser(user) : null;
  const isOwner = appUser?.id === task.project.ownerId;
  const isAssignee = appUser?.id === task.assignee?.id;
  const canClaim = Boolean(appUser && task.status === "OPEN" && !task.assignee);
  const canManageStatus = Boolean(
    (isOwner || isAssignee) &&
    task.status !== "CANCELLED" &&
    task.status !== "COMPLETED",
  );
  const canRelease = Boolean(
    (isOwner || isAssignee) &&
    task.assignee &&
    task.status !== "COMPLETED" &&
    task.status !== "CANCELLED",
  );
  const canCancel = Boolean(isOwner && task.status !== "COMPLETED");
  const isVolunteer = task.amountBrl <= 0;

  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
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
              href={`/projects/${task.project.slug}`}
              className="hover:text-foreground transition-colors"
            >
              {task.project.title}
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="text-foreground">Tarefa</span>
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-3">
              <h1 className="font-heading text-3xl font-semibold tracking-tight">
                {task.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {statusLabels[task.status] ?? task.status}
                </Badge>
                {isVolunteer ? (
                  <Badge variant="outline">Voluntário</Badge>
                ) : (
                  <Badge variant="outline">
                    {currencyFormatter.format(task.amountBrl)}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-2 sm:items-end">
              <TaskStatusActions
                taskId={task.id}
                status={task.status}
                canClaim={canClaim}
                canManageStatus={canManageStatus || canCancel}
                canCancel={canCancel}
                canRelease={canRelease}
              />
              {isOwner ? (
                <Button
                  type="button"
                  variant="ghost"
                  disabled
                  title="Disponível na próxima entrega"
                >
                  Editar
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Descrição
          </h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {task.description}
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {task.assignee ? (
              <>
                <Avatar size="sm">
                  {task.assignee.avatarUrl ? (
                    <AvatarImage src={task.assignee.avatarUrl} alt="" />
                  ) : null}
                  <AvatarFallback className="bg-[oklch(0.78_0.12_130/0.25)] font-semibold text-[oklch(0.45_0.1_145)]">
                    {personInitial(task.assignee.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">Responsável</p>
                  <p className="text-sm font-medium">{task.assignee.name}</p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">Sem responsável</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {task.githubIssueUrl ? (
              <Button asChild variant="outline">
                <a
                  href={task.githubIssueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Issue no GitHub
                  <ExternalLink data-icon="inline-end" />
                </a>
              </Button>
            ) : null}
            <Button asChild variant="ghost">
              <Link href={`/projects/${task.project.slug}`}>
                Voltar ao projeto
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
