import "@/lib/openapi/zod-extend";

import { z } from "zod";

const githubIssueUrlPattern =
  /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/issues\/\d+\/?$/i;

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Informe um título com ao menos 3 caracteres.")
    .max(120, "O título deve ter no máximo 120 caracteres."),
  description: z
    .string()
    .trim()
    .min(10, "A descrição deve ter ao menos 10 caracteres.")
    .max(2000, "A descrição deve ter no máximo 2000 caracteres."),
  githubIssueUrl: z
    .string()
    .trim()
    .refine((value) => value === "" || githubIssueUrlPattern.test(value), {
      error:
        "Use uma URL de issue no GitHub (ex.: https://github.com/org/repo/issues/1).",
    }),
  amountBrl: z.coerce
    .number({ error: "Informe um valor numérico." })
    .min(0, "O valor do bounty não pode ser negativo.")
    .max(1_000_000, "Valor acima do limite permitido."),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const createTaskApiSchema = createTaskSchema.extend({
  projectId: z.string().trim().min(1, "Informe o projeto."),
});

export type CreateTaskApiInput = z.infer<typeof createTaskApiSchema>;
