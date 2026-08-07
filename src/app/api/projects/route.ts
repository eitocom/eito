import { NextResponse } from "next/server";

import { ensureAppUser } from "@/lib/auth/app-user";
import { createProjectForUser } from "@/lib/projects/create-project";
import { listProjects } from "@/lib/projects/queries";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Faça login para listar projetos." },
      { status: 401 },
    );
  }

  const appUser = await ensureAppUser(user);
  const { searchParams } = new URL(request.url);
  const mineOnly = searchParams.get("mine") === "1";

  const projects = await listProjects(
    mineOnly ? { ownerId: appUser.id } : undefined,
  );

  return NextResponse.json({
    projects: projects.map((project) => ({
      ...project,
      createdAt: project.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
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

  const result = await createProjectForUser(user, body);

  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.error,
        ...(result.fieldErrors ? { fieldErrors: result.fieldErrors } : {}),
      },
      { status: result.status },
    );
  }

  return NextResponse.json(
    {
      project: {
        ...result.project,
        createdAt: result.project.createdAt.toISOString(),
      },
    },
    { status: 201 },
  );
}
