import { cn } from "@/lib/utils";
import type { PlatformImpactMetrics } from "@/lib/metrics/platform";

export type ImpactMetricItem = {
  key: string;
  label: string;
  value: string;
};

export type ImpactMetricsProps = {
  metrics: PlatformImpactMetrics;
  className?: string;
};

const numberFormatter = new Intl.NumberFormat("pt-BR");
const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function buildImpactMetricItems(
  metrics: PlatformImpactMetrics,
): ImpactMetricItem[] {
  return [
    {
      key: "projects",
      label: "Projetos cadastrados",
      value: numberFormatter.format(metrics.totalProjects),
    },
    {
      key: "bounties",
      label: "Bounties abertos",
      value: numberFormatter.format(metrics.openBounties),
    },
    {
      key: "developers",
      label: "Desenvolvedores ativos",
      value: numberFormatter.format(metrics.activeDevelopers),
    },
    {
      key: "distributed",
      label: "Total distribuído",
      value: currencyFormatter.format(metrics.totalDistributedBrl),
    },
  ];
}

export function ImpactMetrics({ metrics, className }: ImpactMetricsProps) {
  const items = buildImpactMetricItems(metrics);

  return (
    <section
      aria-labelledby="impact-metrics-heading"
      className={cn("w-full", className)}
    >
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-6 space-y-1">
          <h2
            id="impact-metrics-heading"
            className="font-heading text-xl font-semibold tracking-tight"
          >
            Impacto do mutirão
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Números ao vivo da plataforma — projetos, bounties e valor em PIX.
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <li
              key={item.key}
              className="border-border/80 bg-background/70 supports-backdrop-filter:bg-background/50 rounded-2xl border px-4 py-5 shadow-[inset_0_1px_0_oklch(1_0_0/0.4)] backdrop-blur-sm"
            >
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {item.label}
              </p>
              <p className="font-heading mt-2 text-2xl font-semibold tracking-tight tabular-nums">
                {item.value}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
