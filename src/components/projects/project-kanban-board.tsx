import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const KANBAN_COLUMN_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "UNDER_REVIEW",
  "COMPLETED",
] as const;

export type KanbanColumnStatus = (typeof KANBAN_COLUMN_STATUSES)[number];

export type KanbanColumnConfig = {
  status: KanbanColumnStatus;
  title: string;
  description?: string;
};

export const DEFAULT_KANBAN_COLUMNS: KanbanColumnConfig[] = [
  {
    status: "OPEN",
    title: "A Fazer",
    description: "Bounties abertas para pegar",
  },
  {
    status: "IN_PROGRESS",
    title: "Em Progresso",
    description: "Em desenvolvimento",
  },
  {
    status: "UNDER_REVIEW",
    title: "Em Revisão",
    description: "Aguardando revisão",
  },
  {
    status: "COMPLETED",
    title: "Concluído",
    description: "Entregas finalizadas",
  },
];

export type ProjectKanbanBoardProps = {
  columns?: KanbanColumnConfig[];
  childrenByStatus?: Partial<Record<KanbanColumnStatus, ReactNode>>;
  className?: string;
};

export function ProjectKanbanBoard({
  columns = DEFAULT_KANBAN_COLUMNS,
  childrenByStatus,
  className,
}: ProjectKanbanBoardProps) {
  return (
    <div
      className={cn(
        "flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4",
        className,
      )}
      role="region"
      aria-label="Quadro Kanban do projeto"
    >
      {columns.map((column) => {
        const items = childrenByStatus?.[column.status];

        return (
          <section
            key={column.status}
            aria-labelledby={`kanban-${column.status}`}
            className="border-border bg-muted/30 flex min-h-72 w-[min(100%,18rem)] shrink-0 flex-col rounded-xl border md:w-auto"
            data-status={column.status}
          >
            <header className="border-border space-y-1 border-b px-3 py-3">
              <h2
                id={`kanban-${column.status}`}
                className="font-heading text-sm font-semibold tracking-tight"
              >
                {column.title}
              </h2>
              {column.description ? (
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {column.description}
                </p>
              ) : null}
            </header>

            <div className="flex flex-1 flex-col gap-3 p-3">
              {items ? (
                items
              ) : (
                <p className="text-muted-foreground py-6 text-center text-xs">
                  Nenhuma tarefa nesta coluna
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
