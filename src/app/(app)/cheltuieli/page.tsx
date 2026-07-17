"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatEur } from "@/lib/format";
import { useData } from "@/lib/data-context";
import { ExpenseFormDialog } from "@/components/crud/expense-form-dialog";
import { ExpensesTable } from "./expenses-table";

export default function CheltuieliPage() {
  const { expenses, projects, clients } = useData();

  const clientNume = new Map(clients.map((c) => [c.id, c.nume]));
  const projectOptions = projects.map((p) => ({
    id: p.id,
    label: `${clientNume.get(p.client_id) ?? "—"} — ${p.nume}`,
  }));
  const projectLabels = Object.fromEntries(projectOptions.map((p) => [p.id, p.label]));

  const total = expenses.reduce((s, e) => s + Number(e.suma_total), 0);
  const totalDeclarat = expenses
    .filter((e) => e.declarat)
    .reduce((s, e) => s + Number(e.suma_total), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cheltuieli</h1>
          <p className="text-sm text-muted-foreground">
            {expenses.length} {expenses.length === 1 ? "tranzacție" : "tranzacții"} · Total:{" "}
            {formatEur(total)} ({formatEur(totalDeclarat)} facturate)
          </p>
        </div>
        <ExpenseFormDialog projects={projectOptions}>
          <Button>
            <Plus className="mr-2 size-4" />
            Adaugă cheltuială
          </Button>
        </ExpenseFormDialog>
      </div>

      <ExpensesTable
        expenses={expenses}
        projects={projectOptions}
        projectLabels={projectLabels}
      />
    </div>
  );
}
