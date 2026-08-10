export interface CreateGitHubIssueInput {
  repoUrl: string;
  title: string;
  description?: string | null;
  providerToken: string;
}

export function parseRepoUrl(repoUrl: string): { owner: string; repo: string } | null {
  try {
    const cleanUrl = repoUrl.replace(/\.git$/, "").replace(/\/$/, "");
    const parts = cleanUrl.split("/");
    if (parts.length >= 2) {
      return {
        owner: parts[parts.length - 2],
        repo: parts[parts.length - 1],
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function createGitHubIssueForTask(input: CreateGitHubIssueInput): {
  success: boolean;
  issueNumber?: number;
  issueUrl?: string;
  error?: string;
} {
  const parsed = parseRepoUrl(input.repoUrl);
  if (!parsed) {
    return { success: false, error: "Invalid GitHub repository URL" };
  }

  if (!input.providerToken) {
    return { success: false, error: "GitHub provider token is required" };
  }

  // Simulated Octokit REST call payload formatting
  const formattedBody = `${input.description || ""}\n\n---\n🌾 *Bounty cadastrado no Eito*`;
  const mockIssueNumber = Math.floor(Math.random() * 1000) + 1;
  const mockIssueUrl = `https://github.com/${parsed.owner}/${parsed.repo}/issues/${mockIssueNumber}`;

  return {
    success: true,
    issueNumber: mockIssueNumber,
    issueUrl: mockIssueUrl,
  };
}
