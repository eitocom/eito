import { prisma } from "@/lib/prisma";

export type ProjectListItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  githubRepoUrl: string;
  owner: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  stats: {
    openBounties: number;
    totalBountyValue: number;
  };
  createdAt: Date;
};

export type ProjectDetail = {
  id: string;
  title: string;
  slug: string;
  description: string;
  githubRepoUrl: string;
  ownerId: string;
  owner: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    githubIssueUrl: string | null;
    amountBrl: number;
    status: string;
    assignee: {
      id: string;
      name: string;
      username: string;
      avatarUrl: string | null;
    } | null;
  }>;
  stats: {
    openBounties: number;
    totalBountyValue: number;
  };
  createdAt: Date;
  updatedAt: Date;
};

function mapOwner(owner: {
  id: string;
  name: string | null;
  username: string;
  avatarUrl: string | null;
}) {
  return {
    id: owner.id,
    name: owner.name || owner.username,
    username: owner.username,
    avatarUrl: owner.avatarUrl,
  };
}

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
      createdAt: true,
      owner: {
        select: {
          id: true,
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
    createdAt: project.createdAt,
    owner: mapOwner(project.owner),
    stats: {
      openBounties: project.tasks.length,
      totalBountyValue: project.tasks.reduce(
        (sum, task) => sum + task.amountBrl,
        0,
      ),
    },
  }));
}

export async function getProjectBySlug(
  slug: string,
): Promise<ProjectDetail | null> {
  const project = await prisma.project.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      githubRepoUrl: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
      owner: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true,
        },
      },
      tasks: {
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          githubIssueUrl: true,
          amountBrl: true,
          status: true,
          assignee: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  if (!project) return null;

  const openTasks = project.tasks.filter((task) => task.status === "OPEN");

  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    description: project.description,
    githubRepoUrl: project.githubRepoUrl,
    ownerId: project.ownerId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    owner: mapOwner(project.owner),
    tasks: project.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      githubIssueUrl: task.githubIssueUrl,
      amountBrl: task.amountBrl,
      status: task.status,
      assignee: task.assignee
        ? {
            id: task.assignee.id,
            name: task.assignee.name || task.assignee.username,
            username: task.assignee.username,
            avatarUrl: task.assignee.avatarUrl,
          }
        : null,
    })),
    stats: {
      openBounties: openTasks.length,
      totalBountyValue: openTasks.reduce(
        (sum, task) => sum + task.amountBrl,
        0,
      ),
    },
  };
}
