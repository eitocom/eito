"use server";

import { ensureAppUser } from "@/lib/auth/app-user";
import { prisma } from "@/lib/prisma";
import {
  updatePixKeySchema,
  type UpdatePixKeyInput,
} from "@/lib/profile/schema";
import { createClient } from "@/lib/supabase/server";

export type UpdatePixKeyFieldErrors = Partial<
  Record<keyof UpdatePixKeyInput, string[]>
>;

export type UpdatePixKeyResult =
  | {
      ok: true;
      pixKey: string | null;
    }
  | {
      ok: false;
      error: string;
      fieldErrors?: UpdatePixKeyFieldErrors;
    };

export async function updatePixKey(
  rawInput: UpdatePixKeyInput,
): Promise<UpdatePixKeyResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Faça login para atualizar sua chave PIX." };
  }

  const parsed = updatePixKeySchema.safeParse(rawInput);

  if (!parsed.success) {
    const fieldErrors: UpdatePixKeyFieldErrors = {};

    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key !== "pixKey") continue;
      fieldErrors.pixKey = [...(fieldErrors.pixKey ?? []), issue.message];
    }

    return {
      ok: false,
      error: "Revise a chave PIX e tente novamente.",
      fieldErrors,
    };
  }

  const appUser = await ensureAppUser(user);
  const pixKey = parsed.data.pixKey === "" ? null : parsed.data.pixKey;

  try {
    const updated = await prisma.user.update({
      where: { id: appUser.id },
      data: { pixKey },
      select: { pixKey: true },
    });

    return { ok: true, pixKey: updated.pixKey };
  } catch {
    return {
      ok: false,
      error: "Não foi possível salvar a chave PIX. Tente novamente.",
    };
  }
}
