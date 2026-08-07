import { NextResponse } from "next/server";

import { getTaskById } from "@/lib/tasks/get-task";
import { updateTaskForUser } from "@/lib/tasks/update-task";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Faça login para ver a tarefa." },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const task = await getTaskById(id);

  if (!task) {
    return NextResponse.json(
      { error: "Tarefa não encontrada." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    task: {
      ...task,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      contributions: task.contributions.map((contribution) => ({
        ...contribution,
        createdAt: contribution.createdAt.toISOString(),
      })),
    },
  });
}

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
  const result = await updateTaskForUser(user, id, body);

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
    task: {
      ...result.task,
      updatedAt: result.task.updatedAt.toISOString(),
    },
  });
}
