import { prisma } from "@/lib/prisma";

export type ProfileTaskRow = {
  id: string;
  title: string;
  amountBrl: number;
  status: string;
  projectTitle: string;
  projectSlug: string;
};

export type ProfileBountySummary = {
  totalReceivedBrl: number;
  completedCount: number;
  inProgressCount: number;
  tasks: ProfileTaskRow[];
};

export async function getProfileBountySummary(
  userId: string,
): Promise<ProfileBountySummary> {
  const tasks = await prisma.task.findMany({
    where: { assigneeId: userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      amountBrl: true,
      status: true,
      project: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
  });

  let totalReceivedBrl = 0;
  let completedCount = 0;
  let inProgressCount = 0;

  const rows: ProfileTaskRow[] = tasks.map((task) => {
    if (task.status === "COMPLETED") {
      completedCount += 1;
      totalReceivedBrl += task.amountBrl;
    }

    if (task.status === "IN_PROGRESS" || task.status === "UNDER_REVIEW") {
      inProgressCount += 1;
    }

    return {
      id: task.id,
      title: task.title,
      amountBrl: task.amountBrl,
      status: task.status,
      projectTitle: task.project.title,
      projectSlug: task.project.slug,
    };
  });

  return {
    totalReceivedBrl,
    completedCount,
    inProgressCount,
    tasks: rows,
  };
}
