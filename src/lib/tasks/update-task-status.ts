import type { User as AuthUser } from "@supabase/supabase-js";

import { ensureAppUser } from "@/lib/auth/app-user";
import { prisma } from "@/lib/prisma";
import { taskStatusActionSchema } from "@/lib/tasks/status-schema";

export type TaskStatusServiceResult =
  | {
      ok: true;
      status: 200;
      task: {
        id: string;
        title: string;
        description: string;
        githubIssueUrl: string | null;
        amountBrl: number;
        status: string;
        projectId: string;
        assigneeId: string | null;
        updatedAt: Date;
      };
    }
  | {
      ok: false;
      status: 400 | 401 | 403 | 404 | 409 | 500;
      error: string;
    };

const taskSelect = {
  id: true,
  title: true,
  description: true,
  githubIssueUrl: true,
  amountBrl: true,
  status: true,
  projectId: true,
  assigneeId: true,
  updatedAt: true,
} as const;

export async function updateTaskStatusForUser(
  authUser: AuthUser | null,
  taskId: string,
  rawInput: unknown,
): Promise<TaskStatusServiceResult> {
  if (!authUser) {
    return {
      ok: false,
      status: 401,
      error: "Faça login para atualizar o status da tarefa.",
    };
  }

  const appUser = await ensureAppUser(authUser);
  const parsed = taskStatusActionSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      error: "Ação de status inválida. Revise o payload e tente novamente.",
    };
  }

  const existing = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      status: true,
      assigneeId: true,
      project: { select: { ownerId: true } },
    },
  });

  if (!existing) {
    return {
      ok: false,
      status: 404,
      error: "Tarefa não encontrada.",
    };
  }

  const isOwner = existing.project.ownerId === appUser.id;
  const isAssignee = existing.assigneeId === appUser.id;
  const action = parsed.data;

  try {
    if (action.action === "claim") {
      if (existing.status !== "OPEN" || existing.assigneeId) {
        return {
          ok: false,
          status: 409,
          error: "Só é possível assumir tarefas abertas sem responsável.",
        };
      }

      const task = await prisma.task.update({
        where: { id: existing.id },
        data: {
          assigneeId: appUser.id,
          status: "IN_PROGRESS",
        },
        select: taskSelect,
      });

      return { ok: true, status: 200, task };
    }

    if (action.action === "release") {
      if (!existing.assigneeId) {
        return {
          ok: false,
          status: 409,
          error: "Esta tarefa não tem responsável para liberar.",
        };
      }

      if (!isOwner && !isAssignee) {
        return {
          ok: false,
          status: 403,
          error: "Apenas o responsável ou o dono do projeto podem liberar a tarefa.",
        };
      }

      const task = await prisma.task.update({
        where: { id: existing.id },
        data: {
          assigneeId: null,
          status:
            existing.status === "COMPLETED" || existing.status === "CANCELLED"
              ? existing.status
              : "OPEN",
        },
        select: taskSelect,
      });

      return { ok: true, status: 200, task };
    }

    if (action.action === "cancel") {
      if (!isOwner) {
        return {
          ok: false,
          status: 403,
          error: "Apenas o dono do projeto pode cancelar a tarefa.",
        };
      }

      if (existing.status === "COMPLETED") {
        return {
          ok: false,
          status: 409,
          error: "Tarefas concluídas não podem ser canceladas.",
        };
      }

      const task = await prisma.task.update({
        where: { id: existing.id },
        data: { status: "CANCELLED" },
        select: taskSelect,
      });

      return { ok: true, status: 200, task };
    }

    // setStatus
    if (action.status === "CANCELLED") {
      return {
        ok: false,
        status: 400,
        error: "Use a ação cancel para cancelar a tarefa.",
      };
    }

    if (!isOwner && !isAssignee) {
      return {
        ok: false,
        status: 403,
        error: "Apenas o responsável ou o dono do projeto podem alterar o status.",
      };
    }

    if (!isOwner && action.status === "OPEN") {
      return {
        ok: false,
        status: 403,
        error: "O responsável não pode reabrir a tarefa como OPEN. Use release.",
      };
    }

    const task = await prisma.task.update({
      where: { id: existing.id },
      data: { status: action.status },
      select: taskSelect,
    });

    return { ok: true, status: 200, task };
  } catch {
    return {
      ok: false,
      status: 500,
      error: "Não foi possível atualizar o status da tarefa. Tente novamente.",
    };
  }
}
