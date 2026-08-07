"use client";

import { useRouter } from "next/navigation";

import { CreateTaskDialog } from "@/components/projects/create-task-dialog";

export function ProjectOwnerActions({
  projectId,
  canCreateTask,
}: {
  projectId: string;
  canCreateTask: boolean;
}) {
  const router = useRouter();

  if (!canCreateTask) return null;

  return (
    <CreateTaskDialog
      projectId={projectId}
      onCreated={() => {
        router.refresh();
      }}
    />
  );
}
