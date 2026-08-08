import { handlePROpenedWebhook, parseLinkedIssueNumbers, EitoTask } from './pr-opened';

describe('PR Opened Webhook Handler', () => {
  it('should parse Fixes #N, Closes #N, Resolves #N from PR body', () => {
    const text = 'This PR Fixes #12 and Resolves #34';
    const issues = parseLinkedIssueNumbers(text);
    expect(issues).toEqual([12, 34]);
  });

  it('should move Task to UNDER_REVIEW when linked issue matches', () => {
    const task: EitoTask = {
      id: 'task_76',
      githubIssueNumber: 12,
      status: 'OPEN',
    };

    const payload = {
      action: 'opened',
      pull_request: {
        html_url: 'https://github.com/org/repo/pull/42',
        number: 42,
        title: 'Fix issue',
        body: 'Resolves #12',
        user: { id: 100, login: 'contributor' },
      },
      repository: { full_name: 'org/repo' },
    };

    const result = handlePROpenedWebhook(payload, task);
    expect(result.task.status).toBe('UNDER_REVIEW');
    expect(result.contribution.githubPrUrl).toBe('https://github.com/org/repo/pull/42');
  });

  it('should not overwrite COMPLETED task status', () => {
    const task: EitoTask = {
      id: 'task_76',
      githubIssueNumber: 12,
      status: 'COMPLETED',
    };

    const payload = {
      action: 'opened',
      pull_request: {
        html_url: 'https://github.com/org/repo/pull/42',
        number: 42,
        title: 'Fix issue',
        body: 'Fixes #12',
        user: { id: 100, login: 'contributor' },
      },
      repository: { full_name: 'org/repo' },
    };

    const result = handlePROpenedWebhook(payload, task);
    expect(result.task.status).toBe('COMPLETED');
  });
});
