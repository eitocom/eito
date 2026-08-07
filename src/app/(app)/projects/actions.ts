"use server";

import { can, ensureAppUser, hasGitHubConnected } from "@/lib/auth/app-user";
import { prisma } from "@/lib/prisma";
import {
  createProjectSchema,
  normalizeGitHubRepoUrl,
  type CreateProjectInput,
} from "@/lib/projects/schema";
import { slugifyProjectTitle } from "@/lib/projects/slug";
import { createClient } from "@/lib/supabase/server";

export type CreateProjectFieldErrors = Partial<
  Record<keyof CreateProjectInput, string[]>
>;

export type CreateProjectResult =
  | {
      ok: true;
      project: {
        id: string;
        title: string;
        slug: string;
        githubRepoUrl: string;
      };
    }
  | {
      ok: false;
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

export async function createProject(
  rawInput: CreateProjectInput,
): Promise<CreateProjectResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Faça login para cadastrar um projeto." };
  }

  const appUser = await ensureAppUser(user);

  if (!hasGitHubConnected(appUser) || !can(appUser, "create_projects")) {
    return {
      ok: false,
      error: "Conecte sua conta GitHub para criar projetos no Eito.",
    };
  }

  const parsed = createProjectSchema.safeParse(rawInput);

  if (!parsed.success) {
    const fieldErrors: CreateProjectFieldErrors = {};

    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key !== "title" && key !== "description" && key !== "githubRepoUrl") {
        continue;
      }

      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
    }

    return {
      ok: false,
      error: "Revise os campos destacados e tente novamente.",
      fieldErrors,
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
        githubRepoUrl: true,
      },
    });

    return { ok: true, project };
  } catch {
    return {
      ok: false,
      error: "Não foi possível criar o projeto. Tente novamente.",
    };
  }
}
