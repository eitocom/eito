import { prisma } from "@/lib/prisma";

export type PlatformImpactMetrics = {
  totalProjects: number;
  openBounties: number;
  activeDevelopers: number;
  totalDistributedBrl: number;
};

export async function getPlatformImpactMetrics(): Promise<PlatformImpactMetrics> {
  const [totalProjects, openBounties, activeDevelopers, completedTasks] =
    await Promise.all([
      prisma.project.count(),
      prisma.task.count({ where: { status: "OPEN" } }),
      prisma.user.count({ where: { githubId: { not: null } } }),
      prisma.task.findMany({
        where: { status: "COMPLETED" },
        select: { amountBrl: true },
      }),
    ]);

  const totalDistributedBrl = completedTasks.reduce(
    (sum, task) => sum + task.amountBrl,
    0,
  );

  return {
    totalProjects,
    openBounties,
    activeDevelopers,
    totalDistributedBrl,
  };
}
