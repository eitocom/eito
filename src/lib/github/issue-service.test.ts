import { createGitHubIssueForTask, parseRepoUrl } from "./issue-service";

describe("GitHub Issue Service (#74)", () => {
  it("should parse owner and repo from GitHub repo URL", () => {
    const res = parseRepoUrl("https://github.com/eitocom/eito");
    expect(res).toEqual({ owner: "eitocom", repo: "eito" });
  });

  it("should return formatted issue details when provider token is passed", async () => {
    const res = await createGitHubIssueForTask({
      repoUrl: "https://github.com/eitocom/eito",
      title: "New Bounty Task Title",
      description: "Bounty task description text.",
      providerToken: "gho_mock_provider_token_123",
    });

    expect(res.success).toBe(true);
    expect(res.issueNumber).toBeGreaterThan(0);
    expect(res.issueUrl).toContain("https://github.com/eitocom/eito/issues/");
  });
});
