"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type Resolver } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createTaskSchema, type CreateTaskInput } from "@/lib/tasks/schema";

export type CreateTaskDialogProps = {
  projectId: string;
  disabled?: boolean;
  onCreated?: (task: { id: string; title: string; amountBrl: number }) => void;
};

export function CreateTaskDialog({
  projectId,
  disabled = false,
  onCreated,
}: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema) as Resolver<CreateTaskInput>,
    defaultValues: {
      title: "",
      description: "",
      githubIssueUrl: "",
      amountBrl: 0,
    },
  });

  function onSubmit(values: CreateTaskInput) {
    setFormError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            title: values.title,
            description: values.description,
            githubIssueUrl: values.githubIssueUrl || undefined,
            amountBrl: values.amountBrl,
          }),
        });

        const payload = (await response.json().catch(() => null)) as {
          error?: string;
          fieldErrors?: Partial<Record<keyof CreateTaskInput, string[]>>;
          task?: { id: string; title: string; amountBrl: number };
        } | null;

        if (!response.ok) {
          if (payload?.fieldErrors) {
            for (const [key, messages] of Object.entries(payload.fieldErrors)) {
              const message = messages?.[0];
              if (!message) continue;
              form.setError(key as keyof CreateTaskInput, { message });
            }
          }

          setFormError(
            payload?.error ??
              "Não foi possível criar a tarefa. Tente novamente.",
          );
          return;
        }

        if (payload?.task) {
          onCreated?.(payload.task);
        }

        setSuccess("Tarefa cadastrada com sucesso.");
        form.reset({
          title: "",
          description: "",
          githubIssueUrl: "",
          amountBrl: 0,
        });
        setOpen(false);
      } catch {
        setFormError("Falha de rede ao criar a tarefa.");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setFormError(null);
          setSuccess(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" disabled={disabled}>
          Nova tarefa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova tarefa / bounty</DialogTitle>
          <DialogDescription>
            Cadastre uma issue com recompensa em R$ para o mutirão.
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Título</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Ex.: Corrigir callback OAuth"
                    disabled={pending}
                  />
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
                  <FieldLabel htmlFor={field.name}>
                    Descrição / instruções
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="O que precisa ser entregue e critérios de aceite."
                    disabled={pending}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />

            <Controller
              name="githubIssueUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    URL da issue no GitHub
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="url"
                    aria-invalid={fieldState.invalid}
                    placeholder="https://github.com/org/repo/issues/1"
                    disabled={pending}
                  />
                  <FieldDescription>
                    Opcional, mas recomendado.
                  </FieldDescription>
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />

            <Controller
              name="amountBrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Valor do bounty (R$)
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    min={0}
                    step="0.01"
                    aria-invalid={fieldState.invalid}
                    disabled={pending}
                    onChange={(event) =>
                      field.onChange(event.target.valueAsNumber)
                    }
                  />
                  <FieldDescription>
                    Use 0 para tarefa voluntária.
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending || disabled}>
              {pending ? "Salvando…" : "Criar tarefa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
