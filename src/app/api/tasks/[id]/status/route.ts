import { NextResponse } from "next/server";

import { updateTaskStatusForUser } from "@/lib/tasks/update-task-status";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
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

  const { id } = await context.params;
  const result = await updateTaskStatusForUser(user, id, body);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    task: {
      ...result.task,
      updatedAt: result.task.updatedAt.toISOString(),
    },
  });
}
