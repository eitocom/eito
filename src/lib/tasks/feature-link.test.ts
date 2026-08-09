import { createTaskWithFeatureSchema, validateTaskFeatureMatch } from "./feature-link";

describe("Task Feature Parent Validation (#69)", () => {
  it("should parse task schema with optional featureId", () => {
    const result = createTaskWithFeatureSchema.safeParse({
      title: "New Task",
      projectId: "proj_123",
      featureId: "feat_456",
    });
    expect(result.success).toBe(true);
  });

  it("should match task projectId and feature projectId", () => {
    expect(validateTaskFeatureMatch("proj_1", "proj_1")).toBe(true);
    expect(validateTaskFeatureMatch("proj_1", "proj_2")).toBe(false);
  });
});
