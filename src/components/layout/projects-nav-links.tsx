"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProjectsNavLinks({
  canCreateProject = false,
}: {
  canCreateProject?: boolean;
}) {
  const pathname = usePathname();
  const onProjects =
    pathname === "/projects" || pathname.startsWith("/projects/");

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className={cn(onProjects && "bg-muted text-foreground")}
      >
        <Link href="/projects" aria-current={onProjects ? "page" : undefined}>
          Projetos
        </Link>
      </Button>
      {canCreateProject ? (
        <Button
          asChild
          size="sm"
          variant="outline"
          className="hidden sm:inline-flex"
        >
          <Link href="/projects/new">Novo projeto</Link>
        </Button>
      ) : null}
    </div>
  );
}
