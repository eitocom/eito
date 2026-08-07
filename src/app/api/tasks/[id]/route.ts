import { NextResponse } from "next/server";

import { getTaskById } from "@/lib/tasks/get-task";
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
    },
  });
}
