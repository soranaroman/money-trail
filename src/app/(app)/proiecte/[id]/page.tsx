"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Copy, Pencil, Plus } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import {
  formatEur,
  formatDate,
  statusLabel,
  statusColor,
  incomeTipLabel,
  categorieLabel,
} from "@/lib/format";
import { useData } from "@/lib/data-context";
import { expensesForProject as expensesForProjectFn } from "@/lib/derive";
import { ProjectFormDialog } from "@/components/crud/project-form-dialog";
import { IncomeFormDialog } from "@/components/crud/income-form-dialog";
import { ExpenseFormDialog } from "@/components/crud/expense-form-dialog";
import { DeleteButton } from "@/components/crud/delete-button";

export default function ProiectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    projects: allProjects,
    clients,
    incomes: allIncomes,
    expenses: allExpenses,
    workdays: allWorkdays,
    employees,
    deleteProject,
    deleteIncome,
    deleteExpense,
  } = useData();

  const project = allProjects.find((p) => p.id === id);
  if (!project) notFound();

  const client = clients.find((c) => c.id === project.client_id) ?? null;
  const incomes = allIncomes
    .filter((i) => i.project_id === project.id)
    .sort((a, b) => a.data.localeCompare(b.data));
  const expenses = expensesForProjectFn(allExpenses, project.id);
  const workdays = allWorkdays.filter((w) => w.project_id === project.id);

  const oferta = Number(project.oferta_total);
  const incasat = incomes.reduce((s, i) => s + Number(i.suma), 0);

  // manopera: zile per angajat pe proiectul asta
  const zilePerAngajat = new Map<string, number>();
  for (const w of workdays) {
    zilePerAngajat.set(w.employee_id, (zilePerAngajat.get(w.employee_id) ?? 0) + w.zile);
  }
  const rataAngajat = new Map(employees.map((e) => [e.id, e.rata_zi]));
  const numeAngajat = new Map(employees.map((e) => [e.id, e.nume]));
  const manopera = [...zilePerAngajat.entries()].reduce(
    (s, [empId, zile]) => s + zile * (rataAngajat.get(empId) ?? 0),
    0
  );

  const materiale = expenses
    .filter((x) => x.expense.grupa === "materiale")
    .reduce((s, x) => s + x.suma, 0);
  const deplasari = expenses
    .filter((x) => x.expense.grupa === "deplasare")
    .reduce((s, x) => s + x.suma, 0);
  const totalCheltuieli = expenses.reduce((s, x) => s + x.suma, 0);
  const totalCost = totalCheltuieli + manopera;
  const profit = oferta - totalCost;
  const marja = oferta > 0 ? (profit / oferta) * 100 : 0;
  const restDePlata = oferta - incasat;

  const incomeProjectOptions = [
    { id: project.id, label: `${client?.nume ?? "—"} — ${project.nume}` },
  ];
  const clientNume = new Map(clients.map((c) => [c.id, c.nume]));
  const expenseProjectOptions = allProjects.map((p) => ({
    id: p.id,
    label: `${clientNume.get(p.client_id) ?? "—"} — ${p.nume}`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" render={<Link href="/proiecte" />}>
          <ArrowLeft className="mr-1 size-4" />
          Înapoi la proiecte
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{project.nume}</h1>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(project.status)}`}>
              {statusLabel(project.status)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {client?.nume}
            {project.client_final && ` → ${project.client_final}`}
            {" · "}
            {project.locatie}
            {" · Start: "}
            {formatDate(project.data_start)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <ProjectFormDialog project={project} clients={clients}>
            <Button variant="outline" size="sm">
              <Pencil className="mr-1 size-3" />
              Editează
            </Button>
          </ProjectFormDialog>
          <DeleteButton
            action={deleteProject}
            id={project.id}
            confirmMessage={`Ștergi proiectul „${project.nume}"? Încasările asociate se șterg și ele.`}
            redirectTo="/proiecte"
          />
        </div>
      </div>

      {/* KPI-uri */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <KpiCard label="Ofertă" value={formatEur(oferta)} />
        <KpiCard label="Încasat" value={formatEur(incasat)} subtitle={`Rest: ${formatEur(restDePlata)}`} />
        <KpiCard label="Cost real" value={formatEur(totalCost)} subtitle="cheltuieli + manoperă" />
        <KpiCard
          label="Profit estimat"
          value={formatEur(profit)}
          subtitle={profit > 0 ? "în profit" : "în pierdere"}
        />
        <KpiCard
          label="Marjă"
          value={`${marja.toFixed(1)}%`}
          subtitle={marja >= 20 ? "OK" : marja >= 10 ? "scăzută" : "alertă"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Cheltuieli */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Cheltuieli asociate</CardTitle>
                <ExpenseFormDialog
                  projects={expenseProjectOptions}
                  defaultProjectId={project.id}
                >
                  <Button size="sm" variant="outline">
                    <Plus className="mr-1 size-3" />
                    Adaugă cheltuială
                  </Button>
                </ExpenseFormDialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Categorie</TableHead>
                    <TableHead>Descriere</TableHead>
                    <TableHead className="text-right">Sumă (alocată)</TableHead>
                    <TableHead className="text-center">Fact.</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map(({ expense, suma }) => (
                    <TableRow key={expense.id}>
                      <TableCell className="text-sm whitespace-nowrap">
                        {formatDate(expense.data)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {categorieLabel(expense.categorie)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {expense.descriere}
                        {expense.furnizor && (
                          <div className="text-xs text-muted-foreground">{expense.furnizor}</div>
                        )}
                        {expense.alocari.length > 1 && (
                          <div className="text-xs text-amber-600">
                            split din total {formatEur(Number(expense.suma_total))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatEur(suma)}</TableCell>
                      <TableCell className="text-center">
                        {expense.declarat ? (
                          <Badge variant="default" className="text-xs">Da</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Nu</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <ExpenseFormDialog expense={expense} clone projects={expenseProjectOptions}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground"
                              aria-label="Duplică cheltuiala"
                              title="Duplică"
                            >
                              <Copy className="size-3.5" />
                            </Button>
                          </ExpenseFormDialog>
                          <ExpenseFormDialog expense={expense} projects={expenseProjectOptions}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground"
                              aria-label="Editează cheltuiala"
                              title="Editează"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          </ExpenseFormDialog>
                          <DeleteButton
                            action={deleteExpense}
                            id={expense.id}
                            confirmMessage={`Ștergi cheltuiala „${expense.descriere}"?`}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {expenses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">
                        Nicio cheltuială asociată încă
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Manopera */}
          <Card>
            <CardHeader>
              <CardTitle>Manoperă</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Angajat</TableHead>
                    <TableHead className="text-right">Zile lucrate</TableHead>
                    <TableHead className="text-right">Rată/zi</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...zilePerAngajat.entries()].map(([empId, zile]) => (
                    <TableRow key={empId}>
                      <TableCell className="font-medium">{numeAngajat.get(empId) ?? "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">{zile}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatEur(rataAngajat.get(empId) ?? 0)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatEur(zile * (rataAngajat.get(empId) ?? 0))}
                      </TableCell>
                    </TableRow>
                  ))}
                  {zilePerAngajat.size === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">
                        Niciun angajat alocat încă — zilele se adaugă din pagina Angajați
                      </TableCell>
                    </TableRow>
                  )}
                  {zilePerAngajat.size > 0 && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={3} className="text-right font-medium">Total manoperă</TableCell>
                      <TableCell className="text-right font-bold tabular-nums">{formatEur(manopera)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Incasari */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Încasări</CardTitle>
                <IncomeFormDialog projects={incomeProjectOptions} defaultProjectId={project.id}>
                  <Button size="sm" variant="outline">
                    <Plus className="mr-1 size-3" />
                    Adaugă
                  </Button>
                </IncomeFormDialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {incomes.map((inc) => (
                  <div
                    key={inc.id}
                    className="flex items-center justify-between border-b pb-2 text-sm last:border-0 last:pb-0"
                  >
                    <div>
                      <div className="font-medium">{formatEur(Number(inc.suma))}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(inc.data)} · {incomeTipLabel(inc.tip)} · {inc.mod_plata}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {inc.declarat ? (
                        <Badge variant="default" className="text-xs">Fact.</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Nefact.</Badge>
                      )}
                      <IncomeFormDialog income={inc} clone projects={incomeProjectOptions}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground"
                          aria-label="Duplică încasarea"
                          title="Duplică"
                        >
                          <Copy className="size-3.5" />
                        </Button>
                      </IncomeFormDialog>
                      <IncomeFormDialog income={inc} projects={incomeProjectOptions}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground"
                          aria-label="Editează încasarea"
                          title="Editează"
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      </IncomeFormDialog>
                      <DeleteButton
                        action={deleteIncome}
                        id={inc.id}
                        confirmMessage={`Ștergi încasarea de ${formatEur(Number(inc.suma))}?`}
                      />
                    </div>
                  </div>
                ))}
                {incomes.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Nicio încasare încă
                  </p>
                )}
              </div>
              {restDePlata > 0 && (
                <>
                  <Separator className="my-3" />
                  <div className="rounded-md bg-amber-50 p-3 text-sm">
                    <div className="font-medium text-amber-900">Rest de încasat</div>
                    <div className="mt-1 text-lg font-bold text-amber-900">{formatEur(restDePlata)}</div>
                    {project.data_estimata_incasare && (
                      <div className="text-xs text-amber-700">
                        estimat: {formatDate(project.data_estimata_incasare)}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Sumar */}
          <Card>
            <CardHeader>
              <CardTitle>Sumar financiar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ofertă</span>
                <span className="font-medium tabular-nums">{formatEur(oferta)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Încasat</span>
                <span className="tabular-nums">{formatEur(incasat)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Materiale</span>
                <span className="tabular-nums">− {formatEur(materiale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deplasări</span>
                <span className="tabular-nums">− {formatEur(deplasari)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Manoperă</span>
                <span className="tabular-nums">− {formatEur(manopera)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Profit estimat</span>
                <span className={`tabular-nums ${profit > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {formatEur(profit)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Marjă</span>
                <span className="tabular-nums">{marja.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
