export interface FeatureRoadmapInput {
  projectSlug: string;
  featuresCount: number;
}

export function getFeatureRoadmapSummary(input: FeatureRoadmapInput): {
  success: boolean;
  projectSlug: string;
  totalFeatures: number;
  roadmapStatus: string;
} {
  return {
    success: true,
    projectSlug: input.projectSlug,
    totalFeatures: input.featuresCount,
    roadmapStatus: "ACTIVE",
  };
}
