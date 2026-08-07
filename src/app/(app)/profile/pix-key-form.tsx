"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { updatePixKey } from "@/app/(app)/profile/actions";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  updatePixKeySchema,
  type UpdatePixKeyInput,
} from "@/lib/profile/schema";

export function PixKeyForm({
  initialPixKey,
}: {
  initialPixKey: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<UpdatePixKeyInput>({
    resolver: zodResolver(updatePixKeySchema),
    defaultValues: {
      pixKey: initialPixKey ?? "",
    },
  });

  function onSubmit(values: UpdatePixKeyInput) {
    setFormError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await updatePixKey(values);

      if (!result.ok) {
        if (result.fieldErrors?.pixKey?.[0]) {
          form.setError("pixKey", { message: result.fieldErrors.pixKey[0] });
        }
        setFormError(result.error);
        return;
      }

      form.reset({ pixKey: result.pixKey ?? "" });
      setSuccess(
        result.pixKey
          ? "Chave PIX salva com sucesso."
          : "Chave PIX removida com sucesso.",
      );
    });
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <FieldGroup>
        <Controller
          name="pixKey"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Chave PIX</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="CPF, e-mail, telefone ou chave aleatória"
                autoComplete="off"
                disabled={pending}
              />
              <FieldDescription>
                Usada para receber bounties. Deixe em branco para remover a
                chave salva.
              </FieldDescription>
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />
      </FieldGroup>

      {formError ? (
        <p
          role="alert"
          className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm"
        >
          {formError}
        </p>
      ) : null}

      {success ? (
        <p
          role="status"
          className="border-border bg-muted/40 rounded-lg border px-3 py-2 text-sm"
        >
          {success}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="sm:w-auto">
        {pending ? "Salvando…" : "Salvar chave PIX"}
      </Button>
    </form>
  );
}
