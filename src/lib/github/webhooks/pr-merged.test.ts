import { handlePrMergedEvent } from "./pr-merged";

describe("PR Merged Webhook Handler (#77)", () => {
  it("should extract issue numbers and return COMPLETED status when PR is merged", () => {
    const res = handlePrMergedEvent({
      action: "closed",
      pull_request: {
        merged: true,
        title: "fix(ui): resolve task board issue",
        body: "Resolves #77 /claim #77",
        html_url: "https://github.com/org/repo/pull/1",
      },
    });

    expect(res.isMerged).toBe(true);
    expect(res.issueNumbers).toEqual([77]);
    expect(res.targetStatus).toBe("COMPLETED");
  });
});
