export interface PRWebhookPayload {
  action: string;
  pull_request?: {
    merged: boolean;
    number: number;
    title: string;
    body?: string;
  };
  issueNumber?: number;
}

export interface TaskRecord {
  id: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'COMPLETED' | 'CANCELLED';
  githubIssueNumber?: number;
  ownerId: string;
  assigneeId?: string;
  assignee?: {
    id: string;
    pixKey?: string;
  };
}

export interface ContributionRecord {
  id: string;
  taskId: string;
  prNumber: number;
  status: 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';
}

export function handlePRMergedWebhook(
  payload: PRWebhookPayload,
  task: TaskRecord,
  contribution?: ContributionRecord
): { task: TaskRecord; contribution?: ContributionRecord } {
  if (payload.action !== 'closed' || !payload.pull_request?.merged) {
    return { task, contribution };
  }

  if (task.status === 'CANCELLED') {
    return { task, contribution };
  }

  const updatedTask: TaskRecord = {
    ...task,
    status: 'COMPLETED',
  };

  const updatedContribution: ContributionRecord | undefined = contribution
    ? {
        ...contribution,
        status: 'ACCEPTED',
      }
    : undefined;

  return { task: updatedTask, contribution: updatedContribution };
}

export function getTaskDetailsForOwner(
  task: TaskRecord,
  requestorUserId: string
): TaskRecord {
  if (task.status === 'COMPLETED' && task.ownerId === requestorUserId) {
    return task;
  }

  if (task.assignee) {
    const { pixKey, ...sanitizedAssignee } = task.assignee;
    return {
      ...task,
      assignee: sanitizedAssignee,
    };
  }

  return task;
}
