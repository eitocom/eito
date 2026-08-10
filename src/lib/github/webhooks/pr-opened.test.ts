import { handlePrOpenedEvent } from "./pr-opened";

describe("PR Opened/Edited Webhook Handler (#76)", () => {
  it("should parse keywords and return UNDER_REVIEW status on opened PR", () => {
    const res = handlePrOpenedEvent({
      action: "opened",
      pull_request: {
        title: "fix(sec): add authentication middleware",
        body: "Fixes #76",
        html_url: "https://github.com/org/repo/pull/2",
        user: { id: 123, login: "jihadMo" },
      },
    });

    expect(res.isRelevant).toBe(true);
    expect(res.issueNumbers).toEqual([76]);
    expect(res.targetStatus).toBe("UNDER_REVIEW");
  });
});
