export interface PROpenedPayload {
  action: 'opened' | 'edited' | 'reopened' | string;
  pull_request: {
    html_url: string;
    number: number;
    title: string;
    body?: string;
    user: {
      id: number;
      login: string;
    };
  };
  repository: {
    full_name: string;
  };
}

export interface EitoTask {
  id: string;
  githubIssueNumber?: number;
  status: 'OPEN' | 'UNDER_REVIEW' | 'COMPLETED' | 'CANCELLED';
  assigneeId?: string;
  githubRepoUrl?: string;
}

export interface EitoContribution {
  id: string;
  taskId: string;
  githubPrUrl: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';
}

export function parseLinkedIssueNumbers(text: string): number[] {
  const regex = /(?:fixes|closes|resolves)\s+#(\d+)/gi;
  const matches = [...text.matchAll(regex)];
  return matches.map((m) => parseInt(m[1], 10));
}

export function handlePROpenedWebhook(
  payload: PROpenedPayload,
  task: EitoTask,
  existingContribution?: EitoContribution
): { task: EitoTask; contribution: EitoContribution } {
  const text = `${payload.pull_request.title} ${payload.pull_request.body || ''}`;
  const linkedIssues = parseLinkedIssueNumbers(text);

  let updatedTask = { ...task };
  if (
    task.githubIssueNumber &&
    linkedIssues.includes(task.githubIssueNumber) &&
    task.status !== 'COMPLETED' &&
    task.status !== 'CANCELLED'
  ) {
    updatedTask.status = 'UNDER_REVIEW';
  }

  const contribution: EitoContribution = existingContribution
    ? { ...existingContribution, githubPrUrl: payload.pull_request.html_url }
    : {
        id: `contrib_${payload.pull_request.number}`,
        taskId: task.id,
        githubPrUrl: payload.pull_request.html_url,
        status: 'PENDING',
      };

  return { task: updatedTask, contribution };
}
