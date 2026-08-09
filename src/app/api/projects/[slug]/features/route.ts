import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const project = await prisma.project.findUnique({
      where: { slug },
      include: {
        features: {
          include: {
            tasks: {
              select: { id: true, status: true, amountBrl: true },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const featuresWithAggregates = project.features.map((feature) => {
      const tasksTotal = feature.tasks.length;
      const tasksCompleted = feature.tasks.filter((t) => t.status === "COMPLETED").length;
      const bountyTotalBrl = feature.tasks.reduce((sum, t) => sum + (t.amountBrl || 0), 0);

      return {
        ...feature,
        tasksTotal,
        tasksCompleted,
        bountyTotalBrl,
      };
    });

    return NextResponse.json({ features: featuresWithAggregates });
  } catch {
    return NextResponse.json({ error: "Failed to fetch project features" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const { title, description } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { slug } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const feature = await prisma.feature.create({
      data: {
        title: title.trim(),
        description: description || null,
        status: "BACKLOG",
        projectId: project.id,
      },
    });

    return NextResponse.json({ feature }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create feature" }, { status: 500 });
  }
}
