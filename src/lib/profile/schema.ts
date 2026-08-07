import { z } from "zod";

export const updatePixKeySchema = z.object({
  pixKey: z
    .string()
    .trim()
    .max(100, "A chave PIX deve ter no máximo 100 caracteres.")
    .refine(
      (value) => value === "" || value.length >= 3,
      "Informe uma chave PIX com ao menos 3 caracteres.",
    ),
});

export type UpdatePixKeyInput = z.infer<typeof updatePixKeySchema>;
