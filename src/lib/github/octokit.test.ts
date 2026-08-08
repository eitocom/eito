import { parseRepoOwnerAndName, createGitHubIssueForTask } from './octokit';

describe('Octokit Issue Creator Helper', () => {
  it('should parse repo owner and name correctly from GitHub URL', () => {
    const parsed = parseRepoOwnerAndName('https://github.com/eitocom/eito');
    expect(parsed).toEqual({ owner: 'eitocom', repo: 'eito' });
  });

  it('should not call Octokit when manual githubIssueUrl is provided', async () => {
    const mockCreate = jest.fn();
    const result = await createGitHubIssueForTask(
      {
        title: 'Manual Task',
        githubRepoUrl: 'https://github.com/eitocom/eito',
        githubIssueUrl: 'https://github.com/eitocom/eito/issues/42',
      },
      mockCreate
    );

    expect(mockCreate).not.toHaveBeenCalled();
    expect(result?.githubIssueNumber).toBe(42);
    expect(result?.autoCreated).toBe(false);
  });

  it('should auto-create issue via Octokit when githubIssueUrl is empty', async () => {
    const mockCreate = jest.fn().mockResolvedValue({
      html_url: 'https://github.com/eitocom/eito/issues/100',
      number: 100,
    });

    const result = await createGitHubIssueForTask(
      {
        title: 'New Task',
        description: 'Task description',
        githubRepoUrl: 'https://github.com/eitocom/eito',
        providerToken: 'test_token',
      },
      mockCreate
    );

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: 'eitocom',
        repo: 'eito',
        title: 'New Task',
      })
    );
    expect(result?.githubIssueNumber).toBe(100);
    expect(result?.autoCreated).toBe(true);
  });
});
