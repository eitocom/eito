import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ProjectCardOwner = {
  name: string;
  avatarUrl?: string | null;
};

export type ProjectCardStats = {
  openBounties: number;
  totalBountyValue: number;
};

export type ProjectCardProps = {
  title: string;
  description: string;
  owner: ProjectCardOwner;
  stats: ProjectCardStats;
  githubRepoUrl: string;
  href?: string;
  className?: string;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const bountyCountFormatter = new Intl.NumberFormat("pt-BR");

function ownerInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function formatBountyLabel(count: number) {
  const formatted = bountyCountFormatter.format(count);
  return count === 1
    ? `${formatted} bounty aberta`
    : `${formatted} bounties abertas`;
}

export function ProjectCard({
  title,
  description,
  owner,
  stats,
  githubRepoUrl,
  href,
  className,
}: ProjectCardProps) {
  const totalValue = currencyFormatter.format(stats.totalBountyValue);

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="border-b">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar size="sm" className="mt-0.5">
            {owner.avatarUrl ? (
              <AvatarImage src={owner.avatarUrl} alt="" />
            ) : null}
            <AvatarFallback className="bg-[oklch(0.78_0.12_130/0.25)] font-semibold text-[oklch(0.45_0.1_145)]">
              {ownerInitial(owner.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1">
            {href ? (
              <CardTitle className="truncate">
                <Link href={href} className="hover:underline">
                  {title}
                </Link>
              </CardTitle>
            ) : (
              <CardTitle className="truncate">{title}</CardTitle>
            )}
            <p className="text-muted-foreground truncate text-xs">
              {owner.name}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <CardDescription className="line-clamp-3 text-sm leading-relaxed">
          {description}
        </CardDescription>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {formatBountyLabel(stats.openBounties)}
          </Badge>
          <Badge variant="outline">{totalValue}</Badge>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 sm:flex-row">
        {href ? (
          <Button asChild size="sm" className="w-full">
            <Link href={href}>Ver projeto</Link>
          </Button>
        ) : null}
        <Button asChild variant="outline" size="sm" className="w-full">
          <a href={githubRepoUrl} target="_blank" rel="noopener noreferrer">
            GitHub
            <ExternalLink data-icon="inline-end" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
