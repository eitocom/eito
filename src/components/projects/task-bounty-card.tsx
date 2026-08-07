"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type TaskBountyAssignee = {
  name: string;
  avatarUrl?: string | null;
};

export type TaskBountyCardProps = {
  title: string;
  amountBrl: number;
  githubIssueUrl?: string | null;
  assignee?: TaskBountyAssignee | null;
  href?: string;
  className?: string;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

function assigneeInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function TaskBountyCard({
  title,
  amountBrl,
  githubIssueUrl,
  assignee,
  href,
  className,
}: TaskBountyCardProps) {
  const isVolunteer = amountBrl <= 0;

  return (
    <Card size="sm" className={cn("gap-3", className)}>
      <CardHeader className="gap-2">
        <CardTitle className="line-clamp-2 text-sm leading-snug">
          {href ? (
            <Link
              href={href}
              className="hover:text-foreground/80 transition-colors"
            >
              {title}
            </Link>
          ) : (
            title
          )}
        </CardTitle>
        {isVolunteer ? (
          <Badge variant="secondary">Voluntário</Badge>
        ) : (
          <Badge variant="outline">{currencyFormatter.format(amountBrl)}</Badge>
        )}
      </CardHeader>

      {(assignee || githubIssueUrl) && (
        <CardContent className="flex items-center justify-between gap-2">
          {assignee ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar size="sm">
                    {assignee.avatarUrl ? (
                      <AvatarImage src={assignee.avatarUrl} alt="" />
                    ) : null}
                    <AvatarFallback className="bg-[oklch(0.78_0.12_130/0.25)] text-xs font-semibold text-[oklch(0.45_0.1_145)]">
                      {assigneeInitial(assignee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-muted-foreground truncate text-xs">
                    {assignee.name}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Responsável: {assignee.name}</TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-muted-foreground text-xs">
              Sem responsável
            </span>
          )}

          {githubIssueUrl ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={githubIssueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground inline-flex size-7 items-center justify-center rounded-md transition-colors"
                  aria-label="Abrir issue no GitHub"
                >
                  <ExternalLink className="size-3.5" />
                </a>
              </TooltipTrigger>
              <TooltipContent>Abrir issue no GitHub</TooltipContent>
            </Tooltip>
          ) : null}
        </CardContent>
      )}

      {!assignee && !githubIssueUrl ? (
        <CardFooter className="text-muted-foreground text-xs">
          Aguardando responsável
        </CardFooter>
      ) : null}
    </Card>
  );
}
