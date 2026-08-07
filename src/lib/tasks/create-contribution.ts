import type { User as AuthUser } from "@supabase/supabase-js";

import { ensureAppUser } from "@/lib/auth/app-user";
import { prisma } from "@/lib/prisma";
import {
  createContributionSchema,
  normalizeGitHubPrUrl,
  type CreateContributionInput,
} from "@/lib/tasks/contribution-schema";

export type CreateContributionFieldErrors = Partial<
  Record<keyof CreateContributionInput, string[]>
>;

export type CreateContributionServiceResult =
  | {
      ok: true;
      status: 201;
      contribution: {
        id: string;
        taskId: string;
        userId: string;
        githubPrUrl: string;
        status: string;
        createdAt: Date;
      };
      taskStatus: string;
    }
  | {
      ok: false;
      status: 400 | 401 | 403 | 404 | 409 | 500;
      error: string;
      fieldErrors?: CreateContributionFieldErrors;
    };

function fieldErrorsFromZod(
  issues: { path: PropertyKey[]; message: string }[],
): CreateContributionFieldErrors {
  const fieldErrors: CreateContributionFieldErrors = {};

  for (const issue of issues) {
    const key = issue.path[0];
    if (key !== "githubPrUrl") continue;
    fieldErrors.githubPrUrl = [
      ...(fieldErrors.githubPrUrl ?? []),
      issue.message,
    ];
  }

  return fieldErrors;
}

export async function createContributionForUser(
  authUser: AuthUser | null,
  taskId: string,
  rawInput: unknown,
): Promise<CreateContributionServiceResult> {
  if (!authUser) {
    return {
      ok: false,
      status: 401,
      error: "Faça login para registrar uma contribuição.",
    };
  }

  const appUser = await ensureAppUser(authUser);
  const parsed = createContributionSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      error: "Revise os campos destacados e tente novamente.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      status: true,
      assigneeId: true,
    },
  });

  if (!task) {
    return {
      ok: false,
      status: 404,
      error: "Tarefa não encontrada.",
    };
  }

  if (task.assigneeId !== appUser.id) {
    return {
      ok: false,
      status: 403,
      error: "Apenas o responsável pela tarefa pode registrar o PR.",
    };
  }

  if (task.status !== "IN_PROGRESS" && task.status !== "UNDER_REVIEW") {
    return {
      ok: false,
      status: 409,
      error:
        "Só é possível registrar contribuição em tarefas em andamento ou em revisão.",
    };
  }

  const githubPrUrl = normalizeGitHubPrUrl(parsed.data.githubPrUrl);

  try {
    const contribution = await prisma.contribution.create({
      data: {
        taskId: task.id,
        userId: appUser.id,
        githubPrUrl,
        status: "PENDING",
      },
      select: {
        id: true,
        taskId: true,
        userId: true,
        githubPrUrl: true,
        status: true,
        createdAt: true,
      },
    });

    let taskStatus: string = task.status;
    if (task.status === "IN_PROGRESS") {
      const updated = await prisma.task.update({
        where: { id: task.id },
        data: { status: "UNDER_REVIEW" },
        select: { status: true },
      });
      taskStatus = updated.status;
    }

    return { ok: true, status: 201, contribution, taskStatus };
  } catch {
    return {
      ok: false,
      status: 500,
      error: "Não foi possível registrar a contribuição. Tente novamente.",
    };
  }
}
