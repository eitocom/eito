import { z } from "zod";

export const taskStatusActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("claim"),
  }),
  z.object({
    action: z.literal("release"),
  }),
  z.object({
    action: z.literal("cancel"),
  }),
  z.object({
    action: z.literal("setStatus"),
    status: z.enum([
      "OPEN",
      "IN_PROGRESS",
      "UNDER_REVIEW",
      "COMPLETED",
      "CANCELLED",
    ]),
  }),
]);

export type TaskStatusActionInput = z.infer<typeof taskStatusActionSchema>;
