"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Aberta" },
  { value: "IN_PROGRESS", label: "Em andamento" },
  { value: "UNDER_REVIEW", label: "Em revisão" },
  { value: "COMPLETED", label: "Concluída" },
] as const;

export type TaskStatusActionsProps = {
  taskId: string;
  status: string;
  canClaim: boolean;
  canManageStatus: boolean;
  canCancel: boolean;
  canRelease: boolean;
};

async function postStatusAction(
  taskId: string,
  body: Record<string, string>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const response = await fetch(`/api/tasks/${taskId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;

  if (!response.ok) {
    return {
      ok: false,
      error: payload?.error ?? "Não foi possível atualizar o status.",
    };
  }

  return { ok: true };
}

export function TaskStatusActions({
  taskId,
  status,
  canClaim,
  canManageStatus,
  canCancel,
  canRelease,
}: TaskStatusActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(body: Record<string, string>) {
    setError(null);
    startTransition(async () => {
      const result = await postStatusAction(taskId, body);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (!canClaim && !canManageStatus && !canCancel && !canRelease) {
    return null;
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2">
        {canClaim ? (
          <Button
            type="button"
            disabled={pending}
            onClick={() => run({ action: "claim" })}
          >
            {pending ? "Assumindo…" : "Pegar bounty"}
          </Button>
        ) : null}

        {canRelease ? (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => run({ action: "release" })}
          >
            Liberar
          </Button>
        ) : null}

        {canManageStatus ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" disabled={pending}>
                Alterar status
                <ChevronDown data-icon="inline-end" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {STATUS_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  disabled={option.value === status || pending}
                  onSelect={() =>
                    run({ action: "setStatus", status: option.value })
                  }
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
              {canCancel ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={status === "CANCELLED" || pending}
                    onSelect={() => run({ action: "cancel" })}
                  >
                    Cancelar tarefa
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        {canCancel && !canManageStatus ? (
          <Button
            type="button"
            variant="outline"
            disabled={pending || status === "CANCELLED"}
            onClick={() => run({ action: "cancel" })}
          >
            Cancelar
          </Button>
        ) : null}
      </div>

      {error ? (
        <p
          role="alert"
          className="border-destructive/30 bg-destructive/10 text-destructive max-w-sm rounded-lg border px-3 py-2 text-sm"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
