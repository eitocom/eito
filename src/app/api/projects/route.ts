import { NextResponse } from "next/server";

import { createProjectForUser } from "@/lib/projects/create-project";
import { createClient } from "@/lib/supabase/server";

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
