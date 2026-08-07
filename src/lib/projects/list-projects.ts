import { prisma } from "@/lib/prisma";

export type ProjectListItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  githubRepoUrl: string;
  owner: {
    name: string;
    avatarUrl: string | null;
  };
  stats: {
    openBounties: number;
    totalBountyValue: number;
  };
};

export async function listProjects(options?: {
  ownerId?: string;
}): Promise<ProjectListItem[]> {
  const projects = await prisma.project.findMany({
    where: options?.ownerId ? { ownerId: options.ownerId } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      githubRepoUrl: true,
      owner: {
        select: {
          name: true,
          username: true,
          avatarUrl: true,
        },
      },
      tasks: {
        where: { status: "OPEN" },
        select: { amountBrl: true },
      },
    },
  });

  return projects.map((project) => ({
    id: project.id,
    title: project.title,
    slug: project.slug,
    description: project.description,
    githubRepoUrl: project.githubRepoUrl,
    owner: {
      name: project.owner.name || project.owner.username,
      avatarUrl: project.owner.avatarUrl,
    },
    stats: {
      openBounties: project.tasks.length,
      totalBountyValue: project.tasks.reduce(
        (sum, task) => sum + task.amountBrl,
        0,
      ),
    },
  }));
}
