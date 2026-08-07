"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import {
  createProject,
  type CreateProjectResult,
} from "@/app/(app)/projects/actions";
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
  createProjectSchema,
  type CreateProjectInput,
} from "@/lib/projects/schema";

type CreatedProject = Extract<CreateProjectResult, { ok: true }>["project"];

export function NewProjectForm() {
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedProject | null>(null);

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      githubRepoUrl: "",
    },
  });

  function onSubmit(values: CreateProjectInput) {
    setFormError(null);

    startTransition(async () => {
      const result = await createProject(values);

      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [key, messages] of Object.entries(result.fieldErrors)) {
            const message = messages?.[0];
            if (!message) continue;
            form.setError(key as keyof CreateProjectInput, { message });
          }
        }

        setFormError(result.error);
        return;
      }

      setCreated(result.project);
      form.reset();
    });
  }

  if (created) {
    return (
      <div className="space-y-6">
        <div
          role="status"
          className="border-border bg-muted/40 space-y-2 rounded-lg border px-4 py-3"
        >
          <p className="text-sm font-medium">Projeto cadastrado com sucesso.</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            <span className="text-foreground font-medium">{created.title}</span>{" "}
            está no mutirão com o slug{" "}
            <span className="text-foreground font-medium">{created.slug}</span>.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <a
              href={created.githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir repositório
            </a>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setCreated(null)}
          >
            Cadastrar outro
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    );
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
                placeholder="Ex.: Eito"
                autoComplete="off"
                disabled={pending}
              />
              <FieldDescription>
                Nome curto que aparece na listagem do mutirão.
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
                placeholder="O que o projeto faz e que tipo de contribuição você busca."
                disabled={pending}
              />
              <FieldDescription>
                Conte o propósito do repositório em poucas frases.
              </FieldDescription>
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
                placeholder="https://github.com/org/repo"
                autoComplete="off"
                disabled={pending}
              />
              <FieldDescription>
                Precisa ser um repositório público no GitHub.
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

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="sm:w-auto"
        >
          {pending ? "Cadastrando…" : "Cadastrar projeto"}
        </Button>
        <Button asChild type="button" variant="ghost" size="lg">
          <Link href="/">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
