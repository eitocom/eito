import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const feature = await prisma.feature.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, slug: true, title: true, ownerId: true },
        },
        tasks: {
          select: { id: true, title: true, status: true, amountBrl: true, assigneeId: true },
        },
      },
    });

    if (!feature) {
      return NextResponse.json({ error: "Feature not found" }, { status: 404 });
    }

    const tasksTotal = feature.tasks.length;
    const tasksCompleted = feature.tasks.filter((t) => t.status === "COMPLETED").length;
    const bountyTotalBrl = feature.tasks.reduce((sum, t) => sum + (t.amountBrl || 0), 0);

    return NextResponse.json({
      feature: {
        ...feature,
        tasksTotal,
        tasksCompleted,
        bountyTotalBrl,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch feature" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, description, status } = body;

    const existing = await prisma.feature.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Feature not found" }, { status: 404 });
    }

    if (status && !["BACKLOG", "IN_PROGRESS", "COMPLETED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await prisma.feature.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(status ? { status } : {}),
      },
    });

    return NextResponse.json({ feature: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update feature" }, { status: 500 });
  }
}
