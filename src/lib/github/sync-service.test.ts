import { syncGitHubProjectState } from "./sync-service";

describe("GitHub Project Sync Service (#79)", () => {
  it("should return SYNCED state for valid project input", () => {
    const res = syncGitHubProjectState({
      projectSlug: "my-bounty-project",
      githubRepoUrl: "https://github.com/eitocom/eito",
    });

    expect(res.success).toBe(true);
    expect(res.status).toBe("SYNCED");
  });
});
