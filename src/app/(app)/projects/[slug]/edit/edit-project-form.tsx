"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { updateProjectAction } from "@/app/(app)/projects/[slug]/edit/actions";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  updateProjectSchema,
  type UpdateProjectInput,
} from "@/lib/projects/schema";

export function EditProjectForm({
  slug,
  initialValues,
}: {
  slug: string;
  initialValues: UpdateProjectInput;
}) {
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<UpdateProjectInput>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: initialValues,
  });

  function onSubmit(values: UpdateProjectInput) {
    setFormError(null);

    startTransition(async () => {
      const result = await updateProjectAction(slug, values);

      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [key, messages] of Object.entries(result.fieldErrors)) {
            const message = messages?.[0];
            if (!message) continue;
            form.setError(key as keyof UpdateProjectInput, { message });
          }
        }
        setFormError(result.error);
      }
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
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Título do projeto</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                disabled={pending}
              />
              <FieldDescription>
                O slug da URL permanece o mesmo após a edição.
              </FieldDescription>
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />

        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Descrição</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                disabled={pending}
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />

        <Controller
          name="githubRepoUrl"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                URL do repositório GitHub
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="url"
                aria-invalid={fieldState.invalid}
                disabled={pending}
              />
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

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Salvando…" : "Salvar alterações"}
        </Button>
        <Button asChild type="button" variant="ghost" size="lg">
          <Link href={`/projects/${slug}`}>Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
