import { handlePRMergedWebhook, getTaskDetailsForOwner, TaskRecord, ContributionRecord } from './webhooks';

describe('Webhook PR Merged Handler', () => {
  it('should transition Task to COMPLETED and Contribution to ACCEPTED when PR merged', () => {
    const task: TaskRecord = {
      id: 'task_1',
      status: 'UNDER_REVIEW',
      ownerId: 'owner_123',
    };
    const contribution: ContributionRecord = {
      id: 'contrib_1',
      taskId: 'task_1',
      prNumber: 42,
      status: 'UNDER_REVIEW',
    };
    const payload = {
      action: 'closed',
      pull_request: { merged: true, number: 42, title: 'Fix issue #1' },
    };

    const result = handlePRMergedWebhook(payload, task, contribution);
    expect(result.task.status).toBe('COMPLETED');
    expect(result.contribution?.status).toBe('ACCEPTED');
  });

  it('should not update Task status if Task is CANCELLED', () => {
    const task: TaskRecord = {
      id: 'task_2',
      status: 'CANCELLED',
      ownerId: 'owner_123',
    };
    const payload = {
      action: 'closed',
      pull_request: { merged: true, number: 42, title: 'Fix issue #1' },
    };

    const result = handlePRMergedWebhook(payload, task);
    expect(result.task.status).toBe('CANCELLED');
  });

  it('should expose pixKey only to project owner on COMPLETED task', () => {
    const task: TaskRecord = {
      id: 'task_3',
      status: 'COMPLETED',
      ownerId: 'owner_123',
      assignee: { id: 'dev_456', pixKey: 'my-pix-key' },
    };

    const ownerView = getTaskDetailsForOwner(task, 'owner_123');
    expect(ownerView.assignee?.pixKey).toBe('my-pix-key');

    const publicView = getTaskDetailsForOwner(task, 'other_user');
    expect(publicView.assignee?.pixKey).toBeUndefined();
  });
});
