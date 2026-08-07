"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

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
import {
  createContributionSchema,
  type CreateContributionInput,
} from "@/lib/tasks/contribution-schema";

export function SubmitContributionDialog({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<CreateContributionInput>({
    resolver: zodResolver(createContributionSchema),
    defaultValues: { githubPrUrl: "" },
  });

  function onSubmit(values: CreateContributionInput) {
    setFormError(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/tasks/${taskId}/contributions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        const payload = (await response.json().catch(() => null)) as {
          error?: string;
          fieldErrors?: Partial<
            Record<keyof CreateContributionInput, string[]>
          >;
        } | null;

        if (!response.ok) {
          if (payload?.fieldErrors) {
            for (const [key, messages] of Object.entries(payload.fieldErrors)) {
              const message = messages?.[0];
              if (!message) continue;
              form.setError(key as keyof CreateContributionInput, { message });
            }
          }
          setFormError(
            payload?.error ?? "Não foi possível registrar a contribuição.",
          );
          return;
        }

        setOpen(false);
        form.reset({ githubPrUrl: "" });
        router.refresh();
      } catch {
        setFormError(
          "Não foi possível registrar a contribuição. Tente novamente.",
        );
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          form.reset({ githubPrUrl: "" });
          setFormError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button">Enviar PR</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar contribuição</DialogTitle>
          <DialogDescription>
            Informe a URL do Pull Request no GitHub vinculado a esta tarefa.
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <FieldGroup>
            <Controller
              name="githubPrUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    URL do Pull Request
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="url"
                    placeholder="https://github.com/org/repo/pull/1"
                    aria-invalid={fieldState.invalid}
                    disabled={pending}
                  />
                  <FieldDescription>
                    A tarefa avança para Em revisão se ainda estiver em
                    andamento.
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
              {pending ? "Enviando…" : "Registrar PR"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
