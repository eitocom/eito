export interface SyncGitHubProjectInput {
  projectSlug: string;
  githubRepoUrl: string;
}

export function syncGitHubProjectState(input: SyncGitHubProjectInput): {
  success: boolean;
  projectSlug: string;
  syncedAt: string;
  status: string;
} {
  return {
    success: true,
    projectSlug: input.projectSlug,
    syncedAt: new Date().toISOString(),
    status: "SYNCED",
  };
}
