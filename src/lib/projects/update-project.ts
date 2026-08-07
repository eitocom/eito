import type { User as AuthUser } from "@supabase/supabase-js";

import { ensureAppUser } from "@/lib/auth/app-user";
import { prisma } from "@/lib/prisma";
import {
  normalizeGitHubRepoUrl,
  updateProjectSchema,
  type UpdateProjectInput,
} from "@/lib/projects/schema";

export type UpdateProjectFieldErrors = Partial<
  Record<keyof UpdateProjectInput, string[]>
>;

export type UpdateProjectServiceResult =
  | {
      ok: true;
      status: 200;
      project: {
        id: string;
        title: string;
        slug: string;
        description: string;
        githubRepoUrl: string;
        ownerId: string;
        updatedAt: Date;
      };
    }
  | {
      ok: false;
      status: 400 | 401 | 403 | 404 | 500;
      error: string;
      fieldErrors?: UpdateProjectFieldErrors;
    };

function fieldErrorsFromZod(
  issues: { path: PropertyKey[]; message: string }[],
): UpdateProjectFieldErrors {
  const fieldErrors: UpdateProjectFieldErrors = {};

  for (const issue of issues) {
    const key = issue.path[0];
    if (key !== "title" && key !== "description" && key !== "githubRepoUrl") {
      continue;
    }
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
  }

  return fieldErrors;
}

export async function updateProjectForUser(
  authUser: AuthUser | null,
  slug: string,
  rawInput: unknown,
): Promise<UpdateProjectServiceResult> {
  if (!authUser) {
    return {
      ok: false,
      status: 401,
      error: "Faça login para editar o projeto.",
    };
  }

  const appUser = await ensureAppUser(authUser);
  const parsed = updateProjectSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      error: "Revise os campos destacados e tente novamente.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  const existing = await prisma.project.findUnique({
    where: { slug },
    select: { id: true, ownerId: true, slug: true },
  });

  if (!existing) {
    return {
      ok: false,
      status: 404,
      error: "Projeto não encontrado.",
    };
  }

  if (existing.ownerId !== appUser.id) {
    return {
      ok: false,
      status: 403,
      error: "Apenas o dono do projeto pode editá-lo.",
    };
  }

  try {
    const project = await prisma.project.update({
      where: { id: existing.id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        githubRepoUrl: normalizeGitHubRepoUrl(parsed.data.githubRepoUrl),
        // Keep slug stable so shared URLs do not break.
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        githubRepoUrl: true,
        ownerId: true,
        updatedAt: true,
      },
    });

    return { ok: true, status: 200, project };
  } catch {
    return {
      ok: false,
      status: 500,
      error: "Não foi possível atualizar o projeto. Tente novamente.",
    };
  }
}
