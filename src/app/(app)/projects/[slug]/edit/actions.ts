"use server";

import { redirect } from "next/navigation";

import { updateProjectForUser } from "@/lib/projects/update-project";
import type { UpdateProjectInput } from "@/lib/projects/schema";
import { createClient } from "@/lib/supabase/server";

export type UpdateProjectActionResult =
  | { ok: true; slug: string }
  | {
      ok: false;
      error: string;
      fieldErrors?: Partial<Record<keyof UpdateProjectInput, string[]>>;
    };

export async function updateProjectAction(
  slug: string,
  rawInput: UpdateProjectInput,
): Promise<UpdateProjectActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const result = await updateProjectForUser(user, slug, rawInput);

  if (!result.ok) {
    return {
      ok: false,
      error: result.error,
      fieldErrors: result.fieldErrors,
    };
  }

  redirect(`/projects/${result.project.slug}`);
}
