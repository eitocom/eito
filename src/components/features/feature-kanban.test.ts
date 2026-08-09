import { COLUMNS, FeatureKanban } from "./feature-kanban";

describe("FeatureKanban Component (#67)", () => {
  it("should define 3 kanban columns (BACKLOG, IN_PROGRESS, COMPLETED)", () => {
    expect(COLUMNS).toHaveLength(3);
    expect(COLUMNS[0].id).toBe("BACKLOG");
    expect(COLUMNS[1].id).toBe("IN_PROGRESS");
    expect(COLUMNS[2].id).toBe("COMPLETED");
  });

  it("should export FeatureKanban component function", () => {
    expect(typeof FeatureKanban).toBe("function");
  });
});
