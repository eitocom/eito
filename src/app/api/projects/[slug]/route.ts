import { NextResponse } from "next/server";

import { getProjectBySlug } from "@/lib/projects/queries";
import { updateProjectForUser } from "@/lib/projects/update-project";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Faça login para ver o projeto." },
      { status: 401 },
    );
  }

  const { slug } = await context.params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return NextResponse.json(
      { error: "Projeto não encontrado." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    project: {
      ...project,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    },
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { slug } = await context.params;
  const result = await updateProjectForUser(user, slug, body);

  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.error,
        ...(result.fieldErrors ? { fieldErrors: result.fieldErrors } : {}),
      },
      { status: result.status },
    );
  }

  return NextResponse.json({
    project: {
      ...result.project,
      updatedAt: result.project.updatedAt.toISOString(),
    },
  });
}
