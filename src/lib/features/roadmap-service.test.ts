import { getFeatureRoadmapSummary } from "./roadmap-service";

describe("Feature Roadmap Service (#71)", () => {
  it("should return ACTIVE roadmap status for valid project input", () => {
    const res = getFeatureRoadmapSummary({
      projectSlug: "demo-roadmap",
      featuresCount: 5,
    });

    expect(res.success).toBe(true);
    expect(res.roadmapStatus).toBe("ACTIVE");
  });
});
