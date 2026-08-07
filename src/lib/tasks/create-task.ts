import type { User as AuthUser } from "@supabase/supabase-js";

import { ensureAppUser } from "@/lib/auth/app-user";
import { prisma } from "@/lib/prisma";
import {
  createTaskApiSchema,
  type CreateTaskApiInput,
} from "@/lib/tasks/schema";

export type CreateTaskFieldErrors = Partial<
  Record<keyof CreateTaskApiInput, string[]>
>;

export type CreateTaskServiceResult =
  | {
      ok: true;
      status: 201;
      task: {
        id: string;
        title: string;
        description: string;
        githubIssueUrl: string | null;
        amountBrl: number;
        status: string;
        projectId: string;
        createdAt: Date;
      };
    }
  | {
      ok: false;
      status: 400 | 401 | 403 | 404 | 500;
      error: string;
      fieldErrors?: CreateTaskFieldErrors;
    };

function fieldErrorsFromZod(
  issues: { path: PropertyKey[]; message: string }[],
): CreateTaskFieldErrors {
  const fieldErrors: CreateTaskFieldErrors = {};
  const allowed = new Set([
    "projectId",
    "title",
    "description",
    "githubIssueUrl",
    "amountBrl",
  ]);

  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key !== "string" || !allowed.has(key)) continue;
    const typedKey = key as keyof CreateTaskApiInput;
    fieldErrors[typedKey] = [...(fieldErrors[typedKey] ?? []), issue.message];
  }

  return fieldErrors;
}

export async function createTaskForUser(
  authUser: AuthUser | null,
  rawInput: unknown,
): Promise<CreateTaskServiceResult> {
  if (!authUser) {
    return {
      ok: false,
      status: 401,
      error: "Faça login para cadastrar uma tarefa.",
    };
  }

  const appUser = await ensureAppUser(authUser);
  const parsed = createTaskApiSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      error: "Revise os campos destacados e tente novamente.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  const project = await prisma.project.findUnique({
    where: { id: parsed.data.projectId },
    select: { id: true, ownerId: true },
  });

  if (!project) {
    return {
      ok: false,
      status: 404,
      error: "Projeto não encontrado.",
    };
  }

  if (project.ownerId !== appUser.id) {
    return {
      ok: false,
      status: 403,
      error: "Apenas o dono do projeto pode criar tarefas.",
    };
  }

  const githubIssueUrl =
    parsed.data.githubIssueUrl.trim() === ""
      ? null
      : parsed.data.githubIssueUrl.trim().replace(/\/+$/, "");

  try {
    const task = await prisma.task.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        githubIssueUrl,
        amountBrl: parsed.data.amountBrl,
        status: "OPEN",
        projectId: project.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        githubIssueUrl: true,
        amountBrl: true,
        status: true,
        projectId: true,
        createdAt: true,
      },
    });

    return { ok: true, status: 201, task };
  } catch {
    return {
      ok: false,
      status: 500,
      error: "Não foi possível criar a tarefa. Tente novamente.",
    };
  }
}
