export interface CreateGitHubIssueInput {
  title: string;
  description?: string;
  githubRepoUrl: string;
  githubIssueUrl?: string;
  providerToken?: string;
}

export interface CreatedGitHubIssueResult {
  githubIssueUrl: string;
  githubIssueNumber: number;
  autoCreated: boolean;
}

export function parseRepoOwnerAndName(repoUrl: string): { owner: string; repo: string } | null {
  try {
    const url = new URL(repoUrl);
    const parts = url.pathname.replace(/^\/+|\/+$/g, '').split('/');
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1].replace(/\.git$/, '') };
    }
  } catch {
    // Return null on invalid URL
  }
  return null;
}

export async function createGitHubIssueForTask(
  input: CreateGitHubIssueInput,
  mockOctokitCreate?: (params: any) => Promise<any>
): Promise<CreatedGitHubIssueResult | null> {
  if (input.githubIssueUrl && input.githubIssueUrl.trim() !== '') {
    const match = input.githubIssueUrl.match(/\/issues\/(\d+)/);
    const num = match ? parseInt(match[1], 10) : 0;
    return {
      githubIssueUrl: input.githubIssueUrl,
      githubIssueNumber: num,
      autoCreated: false,
    };
  }

  if (!input.providerToken) {
    throw new Error('Provider token required to auto-create GitHub issue');
  }

  const parsed = parseRepoOwnerAndName(input.githubRepoUrl);
  if (!parsed) {
    throw new Error('Invalid GitHub repository URL');
  }

  const footer = '\n\n---\n🌾 Bounty cadastrado no Eito';
  const body = `${input.description || ''}${footer}`;

  if (mockOctokitCreate) {
    const resp = await mockOctokitCreate({
      owner: parsed.owner,
      repo: parsed.repo,
      title: input.title,
      body,
    });
    return {
      githubIssueUrl: resp.html_url,
      githubIssueNumber: resp.number,
      autoCreated: true,
    };
  }

  const { Octokit } = await import('@octokit/rest');
  const octokit = new Octokit({ auth: input.providerToken });
  const response = await octokit.rest.issues.create({
    owner: parsed.owner,
    repo: parsed.repo,
    title: input.title,
    body,
  });

  return {
    githubIssueUrl: response.data.html_url,
    githubIssueNumber: response.data.number,
    autoCreated: true,
  };
}
