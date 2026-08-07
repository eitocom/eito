"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { updateTaskSchema, type UpdateTaskInput } from "@/lib/tasks/schema";

export type EditTaskDialogProps = {
  taskId: string;
  initialValues: UpdateTaskInput;
};

export function EditTaskDialog({ taskId, initialValues }: EditTaskDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<UpdateTaskInput>({
    resolver: zodResolver(updateTaskSchema) as Resolver<UpdateTaskInput>,
    defaultValues: initialValues,
  });

  function onSubmit(values: UpdateTaskInput) {
    setFormError(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: values.title,
            description: values.description,
            githubIssueUrl: values.githubIssueUrl,
            amountBrl: values.amountBrl,
          }),
        });

        const payload = (await response.json().catch(() => null)) as {
          error?: string;
          fieldErrors?: Partial<Record<keyof UpdateTaskInput, string[]>>;
        } | null;

        if (!response.ok) {
          if (payload?.fieldErrors) {
            for (const [key, messages] of Object.entries(payload.fieldErrors)) {
              const message = messages?.[0];
              if (!message) continue;
              form.setError(key as keyof UpdateTaskInput, { message });
            }
          }
          setFormError(payload?.error ?? "Não foi possível salvar a tarefa.");
          return;
        }

        setOpen(false);
        router.refresh();
      } catch {
        setFormError("Não foi possível salvar a tarefa. Tente novamente.");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          form.reset(initialValues);
          setFormError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="ghost">
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar tarefa</DialogTitle>
          <DialogDescription>
            Atualize o título, a descrição, o valor e o link da issue no GitHub.
          </DialogDescription>
        </DialogHeader>

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
                  <FieldLabel htmlFor={`edit-${field.name}`}>Título</FieldLabel>
                  <Input
                    {...field}
                    id={`edit-${field.name}`}
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
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`edit-${field.name}`}>
                    Descrição
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id={`edit-${field.name}`}
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
              name="githubIssueUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`edit-${field.name}`}>
                    URL da issue no GitHub
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`edit-${field.name}`}
                    type="url"
                    aria-invalid={fieldState.invalid}
                    disabled={pending}
                  />
                  <FieldDescription>Opcional.</FieldDescription>
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
                  <FieldLabel htmlFor={`edit-${field.name}`}>
                    Valor do bounty (R$)
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`edit-${field.name}`}
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
                    Use 0 para marcar como voluntário.
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

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando…" : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
