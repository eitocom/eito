import { NextResponse } from "next/server";

import { createTaskForUser } from "@/lib/tasks/create-task";
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

  const result = await createTaskForUser(user, body);

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
      task: {
        ...result.task,
        createdAt: result.task.createdAt.toISOString(),
      },
    },
    { status: 201 },
  );
}
