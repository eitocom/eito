import { z } from "zod";

const githubPrUrlPattern =
  /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+\/?$/i;

export const createContributionSchema = z.object({
  githubPrUrl: z
    .string()
    .trim()
    .refine((value) => githubPrUrlPattern.test(value), {
      error:
        "Use uma URL de Pull Request no GitHub (ex.: https://github.com/org/repo/pull/1).",
    }),
});

export type CreateContributionInput = z.infer<typeof createContributionSchema>;

export function normalizeGitHubPrUrl(url: string) {
  return url.trim().replace(/\/+$/, "");
}
