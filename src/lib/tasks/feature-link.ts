import { z } from "zod";

export const createTaskWithFeatureSchema = z.object({
  title: z.string().min(1),
  projectId: z.string().min(1),
  featureId: z.string().optional(),
  amountBrl: z.number().optional(),
});

export function validateTaskFeatureMatch(
  taskProjectId: string,
  featureProjectId: string
): boolean {
  return taskProjectId === featureProjectId;
}
