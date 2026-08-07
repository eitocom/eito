"use server";

import {
  createProjectForUser,
  type CreateProjectFieldErrors,
  type CreateProjectServiceResult,
} from "@/lib/projects/create-project";
import type { CreateProjectInput } from "@/lib/projects/schema";
import { createClient } from "@/lib/supabase/server";

export type { CreateProjectFieldErrors };

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

function toActionResult(
  result: CreateProjectServiceResult,
): CreateProjectResult {
  if (result.ok) {
    return {
      ok: true,
      project: {
        id: result.project.id,
        title: result.project.title,
        slug: result.project.slug,
        githubRepoUrl: result.project.githubRepoUrl,
      },
    };
  }

  return {
    ok: false,
    error: result.error,
    fieldErrors: result.fieldErrors,
  };
}

export async function createProject(
  rawInput: CreateProjectInput,
): Promise<CreateProjectResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return toActionResult(await createProjectForUser(user, rawInput));
}
