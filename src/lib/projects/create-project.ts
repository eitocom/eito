import type { User as AuthUser } from "@supabase/supabase-js";

import { can, ensureAppUser, hasGitHubConnected } from "@/lib/auth/app-user";
import { prisma } from "@/lib/prisma";
import {
  createProjectSchema,
  normalizeGitHubRepoUrl,
  type CreateProjectInput,
} from "@/lib/projects/schema";
import { slugifyProjectTitle } from "@/lib/projects/slug";

export type CreateProjectFieldErrors = Partial<
  Record<keyof CreateProjectInput, string[]>
>;

export type CreateProjectServiceResult =
  | {
      ok: true;
      status: 201;
      project: {
        id: string;
        title: string;
        slug: string;
        description: string;
        githubRepoUrl: string;
        ownerId: string;
        createdAt: Date;
      };
    }
  | {
      ok: false;
      status: 400 | 401 | 403 | 500;
      error: string;
      fieldErrors?: CreateProjectFieldErrors;
    };

async function uniqueProjectSlug(base: string) {
  const root = slugifyProjectTitle(base);
  let candidate = root;
  let attempt = 1;

  while (await prisma.project.findUnique({ where: { slug: candidate } })) {
    attempt += 1;
    candidate = `${root}-${attempt}`;
  }

  return candidate;
}

function fieldErrorsFromZod(
  issues: { path: PropertyKey[]; message: string }[],
): CreateProjectFieldErrors {
  const fieldErrors: CreateProjectFieldErrors = {};

  for (const issue of issues) {
    const key = issue.path[0];
    if (key !== "title" && key !== "description" && key !== "githubRepoUrl") {
      continue;
    }

    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
  }

  return fieldErrors;
}

export async function createProjectForUser(
  authUser: AuthUser | null,
  rawInput: unknown,
): Promise<CreateProjectServiceResult> {
  if (!authUser) {
    return {
      ok: false,
      status: 401,
      error: "Faça login para cadastrar um projeto.",
    };
  }

  const appUser = await ensureAppUser(authUser);

  if (!hasGitHubConnected(appUser) || !can(appUser, "create_projects")) {
    return {
      ok: false,
      status: 403,
      error: "Conecte sua conta GitHub para criar projetos no Eito.",
    };
  }

  const parsed = createProjectSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      error: "Revise os campos destacados e tente novamente.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  const title = parsed.data.title;
  const description = parsed.data.description;
  const githubRepoUrl = normalizeGitHubRepoUrl(parsed.data.githubRepoUrl);
  const slug = await uniqueProjectSlug(title);

  try {
    const project = await prisma.project.create({
      data: {
        title,
        slug,
        description,
        githubRepoUrl,
        ownerId: appUser.id,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        githubRepoUrl: true,
        ownerId: true,
        createdAt: true,
      },
    });

    return { ok: true, status: 201, project };
  } catch {
    return {
      ok: false,
      status: 500,
      error: "Não foi possível criar o projeto. Tente novamente.",
    };
  }
}
