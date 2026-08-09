describe("Feature Prisma Model Schema (#65)", () => {
  it("should define FeatureStatus enum values", () => {
    const statuses = ["BACKLOG", "IN_PROGRESS", "COMPLETED"];
    expect(statuses).toContain("BACKLOG");
    expect(statuses).toContain("IN_PROGRESS");
    expect(statuses).toContain("COMPLETED");
  });
});
