import "@/lib/openapi/zod-extend";

import { z } from "zod";

const githubRepoUrlPattern =
  /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/i;

export const createProjectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Informe um título com ao menos 3 caracteres.")
    .max(80, "O título deve ter no máximo 80 caracteres."),
  description: z
    .string()
    .trim()
    .min(20, "A descrição deve ter ao menos 20 caracteres.")
    .max(500, "A descrição deve ter no máximo 500 caracteres."),
  githubRepoUrl: z
    .url("Informe uma URL válida.")
    .trim()
    .refine((value) => githubRepoUrlPattern.test(value), {
      error:
        "Use uma URL de repositório no GitHub (ex.: https://github.com/org/repo).",
    }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema;

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export function normalizeGitHubRepoUrl(url: string) {
  return url.trim().replace(/\/+$/, "");
}
