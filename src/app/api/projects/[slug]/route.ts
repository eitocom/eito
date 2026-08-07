import { NextResponse } from "next/server";

import { getProjectBySlug } from "@/lib/projects/queries";
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
