import type { User as AuthUser } from "@supabase/supabase-js";

import { ensureAppUser } from "@/lib/auth/app-user";
import { prisma } from "@/lib/prisma";
import {
  normalizeGitHubIssueUrl,
  updateTaskSchema,
  type UpdateTaskInput,
} from "@/lib/tasks/schema";

export type UpdateTaskFieldErrors = Partial<
  Record<keyof UpdateTaskInput, string[]>
>;

export type UpdateTaskServiceResult =
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
        updatedAt: Date;
      };
    }
  | {
      ok: false;
      status: 400 | 401 | 403 | 404 | 500;
      error: string;
      fieldErrors?: UpdateTaskFieldErrors;
    };

function fieldErrorsFromZod(
  issues: { path: PropertyKey[]; message: string }[],
): UpdateTaskFieldErrors {
  const fieldErrors: UpdateTaskFieldErrors = {};
  const allowed = new Set([
    "title",
    "description",
    "githubIssueUrl",
    "amountBrl",
  ]);

  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key !== "string" || !allowed.has(key)) continue;
    const typedKey = key as keyof UpdateTaskInput;
    fieldErrors[typedKey] = [...(fieldErrors[typedKey] ?? []), issue.message];
  }

  return fieldErrors;
}

export async function updateTaskForUser(
  authUser: AuthUser | null,
  taskId: string,
  rawInput: unknown,
): Promise<UpdateTaskServiceResult> {
  if (!authUser) {
    return {
      ok: false,
      status: 401,
      error: "Faça login para editar a tarefa.",
    };
  }

  const appUser = await ensureAppUser(authUser);
  const parsed = updateTaskSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      error: "Revise os campos destacados e tente novamente.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  const existing = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
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

  if (existing.project.ownerId !== appUser.id) {
    return {
      ok: false,
      status: 403,
      error: "Apenas o dono do projeto pode editar a tarefa.",
    };
  }

  try {
    const task = await prisma.task.update({
      where: { id: existing.id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        githubIssueUrl: normalizeGitHubIssueUrl(parsed.data.githubIssueUrl),
        amountBrl: parsed.data.amountBrl,
      },
      select: {
        id: true,
        title: true,
        description: true,
        githubIssueUrl: true,
        amountBrl: true,
        status: true,
        projectId: true,
        updatedAt: true,
      },
    });

    return { ok: true, status: 200, task };
  } catch {
    return {
      ok: false,
      status: 500,
      error: "Não foi possível atualizar a tarefa. Tente novamente.",
    };
  }
}
