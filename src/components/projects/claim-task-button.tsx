"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function ClaimTaskButton({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClaim() {
    setError(null);
    startTransition(async () => {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claim" }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(payload?.error ?? "Não foi possível assumir a tarefa.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-1">
      <Button
        type="button"
        size="sm"
        className="w-full"
        disabled={pending}
        onClick={onClaim}
      >
        {pending ? "Assumindo…" : "Pegar bounty"}
      </Button>
      {error ? (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}
