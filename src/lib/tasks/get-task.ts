import { prisma } from "@/lib/prisma";

export type TaskDetail = {
  id: string;
  title: string;
  description: string;
  githubIssueUrl: string | null;
  amountBrl: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  assignee: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  } | null;
  project: {
    id: string;
    slug: string;
    title: string;
    ownerId: string;
  };
  contributions: Array<{
    id: string;
    githubPrUrl: string;
    status: string;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      username: string;
    };
  }>;
};

function mapAssignee(
  assignee: {
    id: string;
    name: string | null;
    username: string;
    avatarUrl: string | null;
  } | null,
) {
  if (!assignee) return null;

  return {
    id: assignee.id,
    name: assignee.name || assignee.username,
    username: assignee.username,
    avatarUrl: assignee.avatarUrl,
  };
}

export async function getTaskById(id: string): Promise<TaskDetail | null> {
  const task = await prisma.task.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      githubIssueUrl: true,
      amountBrl: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      assignee: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true,
        },
      },
      project: {
        select: {
          id: true,
          slug: true,
          title: true,
          ownerId: true,
        },
      },
      contributions: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          githubPrUrl: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      },
    },
  });

  if (!task) return null;

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    githubIssueUrl: task.githubIssueUrl,
    amountBrl: task.amountBrl,
    status: task.status,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    assignee: mapAssignee(task.assignee),
    project: task.project,
    contributions: task.contributions.map((contribution) => ({
      id: contribution.id,
      githubPrUrl: contribution.githubPrUrl,
      status: contribution.status,
      createdAt: contribution.createdAt,
      user: {
        id: contribution.user.id,
        name: contribution.user.name || contribution.user.username,
        username: contribution.user.username,
      },
    })),
  };
}
