import { NextResponse } from "next/server";

import { createContributionForUser } from "@/lib/tasks/create-contribution";
import { createClient } from "@/lib/supabase/server";

export async function POST(
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
  const result = await createContributionForUser(user, id, body);

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
      contribution: {
        ...result.contribution,
        createdAt: result.contribution.createdAt.toISOString(),
      },
      taskStatus: result.taskStatus,
    },
    { status: 201 },
  );
}
