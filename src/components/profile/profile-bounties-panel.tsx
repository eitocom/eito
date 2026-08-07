import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProfileBountySummary } from "@/lib/profile/contributions";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const statusLabels: Record<string, string> = {
  OPEN: "Aberta",
  IN_PROGRESS: "Em andamento",
  UNDER_REVIEW: "Em revisão",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};

export function ProfileBountiesPanel({
  summary,
}: {
  summary: ProfileBountySummary;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Total recebido</CardDescription>
            <CardTitle className="text-lg">
              {currencyFormatter.format(summary.totalReceivedBrl)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Tarefas concluídas</CardDescription>
            <CardTitle className="text-lg">{summary.completedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Em andamento</CardDescription>
            <CardTitle className="text-lg">{summary.inProgressCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {summary.tasks.length === 0 ? (
        <p
          role="status"
          className="border-border bg-muted/40 rounded-lg border px-4 py-3 text-sm leading-relaxed"
        >
          Você ainda não tem tarefas atribuídas. Quando assumir bounties, o
          histórico aparece aqui.
        </p>
      ) : (
        <div className="border-border overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarefa</TableHead>
                <TableHead>Projeto</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="max-w-48 truncate font-medium">
                    {task.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-36 truncate">
                    {task.projectTitle}
                  </TableCell>
                  <TableCell>
                    {task.amountBrl <= 0
                      ? "Voluntário"
                      : currencyFormatter.format(task.amountBrl)}
                  </TableCell>
                  <TableCell>
                    {statusLabels[task.status] ?? task.status}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
