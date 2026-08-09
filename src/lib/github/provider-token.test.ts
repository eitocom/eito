import { getGitHubProviderToken, REQUIRED_GITHUB_SCOPES } from "./provider-token";

describe("GitHub Provider Token & Scopes (#73)", () => {
  it("should list required repo and user scopes", () => {
    expect(REQUIRED_GITHUB_SCOPES).toContain("repo");
    expect(REQUIRED_GITHUB_SCOPES).toContain("read:user");
  });

  it("should extract provider_token when present", () => {
    const mockUser = { id: "123", provider_token: "gho_mocktoken123" } as any;
    expect(getGitHubProviderToken(mockUser)).toBe("gho_mocktoken123");
  });
});
