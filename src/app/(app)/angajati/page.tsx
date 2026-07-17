"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Plus } from "lucide-react";
import { formatEur, formatDate } from "@/lib/format";
import { useData } from "@/lib/data-context";
import { EmployeeFormDialog } from "@/components/crud/employee-form-dialog";
import { WeekFormDialog } from "@/components/crud/week-form-dialog";
import { DeleteButton } from "@/components/crud/delete-button";

export default function AngajatiPage() {
  const { employees, workdays, projects, clients, deleteEmployee, deleteWeek } = useData();

  const clientNume = new Map(clients.map((c) => [c.id, c.nume]));
  const projectOptions = projects.map((p) => ({
    id: p.id,
    label: `${clientNume.get(p.client_id) ?? "—"} — ${p.nume}`,
  }));
  const projectNume = new Map(projects.map((p) => [p.id, p.nume]));

  // Sumar total per angajat
  const sumar = employees.map((emp) => {
    const ws = workdays.filter((w) => w.employee_id === emp.id);
    const zileTotale = ws.reduce((s, w) => s + w.zile, 0);
    return {
      emp,
      zileTotale,
      cost: zileTotale * emp.rata_zi,
      proiecte: new Set(ws.map((w) => w.project_id)).size,
    };
  });

  // Grila saptamanala (cele mai recente saptamani primele)
  const saptamani = [...new Set(workdays.map((w) => w.week_start))].sort().reverse();
  const grid = saptamani.map((sapt) => {
    const wsThisWeek = workdays.filter((w) => w.week_start === sapt);
    const rataMap = new Map(employees.map((e) => [e.id, e.rata_zi]));
    return {
      sapt,
      randuri: wsThisWeek,
      cost: wsThisWeek.reduce((s, w) => s + w.zile * (rataMap.get(w.employee_id) ?? 0), 0),
    };
  });
  const numeAngajat = new Map(employees.map((e) => [e.id, e.nume]));

  const activi = employees.filter((e) => e.activ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Angajați</h1>
          <p className="text-sm text-muted-foreground">
            {activi} {activi === 1 ? "angajat activ" : "angajați activi"} · grilă săptămânală
            pentru manoperă
          </p>
        </div>
        <div className="flex items-center gap-2">
          <WeekFormDialog employees={employees} projects={projectOptions}>
            <Button variant="outline">
              <Plus className="mr-2 size-4" />
              Săptămână nouă
            </Button>
          </WeekFormDialog>
          <EmployeeFormDialog>
            <Button>
              <Plus className="mr-2 size-4" />
              Adaugă angajat
            </Button>
          </EmployeeFormDialog>
        </div>
      </div>

      {/* Sumar per angajat */}
      <Card>
        <CardHeader>
          <CardTitle>Sumar angajați</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Angajat</TableHead>
                <TableHead className="text-right">Rată/zi</TableHead>
                <TableHead className="text-right">Zile lucrate</TableHead>
                <TableHead className="text-right">Proiecte</TableHead>
                <TableHead className="text-right">Total manoperă</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sumar.map(({ emp, zileTotale, cost, proiecte }) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.nume}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatEur(emp.rata_zi)}</TableCell>
                  <TableCell className="text-right tabular-nums">{zileTotale}</TableCell>
                  <TableCell className="text-right tabular-nums">{proiecte}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{formatEur(cost)}</TableCell>
                  <TableCell className="text-center">
                    {emp.activ ? (
                      <Badge variant="default" className="text-xs">Activ</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Inactiv</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <EmployeeFormDialog employee={emp}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground"
                          aria-label="Editează"
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </EmployeeFormDialog>
                      <DeleteButton
                        action={deleteEmployee}
                        id={emp.id}
                        confirmMessage={`Ștergi angajatul „${emp.nume}"?`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {employees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-6">
                    Niciun angajat încă — adaugă primul cu butonul de sus.
                  </TableCell>
                </TableRow>
              )}
              {employees.length > 0 && (
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={4} className="text-right font-medium">Total manoperă</TableCell>
                  <TableCell className="text-right font-bold tabular-nums">
                    {formatEur(sumar.reduce((s, x) => s + x.cost, 0))}
                  </TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Grila saptamanala */}
      <Card>
        <CardHeader>
          <CardTitle>Grilă săptămânală — zile lucrate</CardTitle>
        </CardHeader>
        <CardContent>
          {grid.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nicio săptămână înregistrată încă — adaugă prima cu butonul „Săptămână nouă&rdquo;.
            </p>
          )}
          <div className="space-y-6">
            {grid.map(({ sapt, randuri, cost }) => (
              <div key={sapt} className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="font-medium">Săptămâna începând cu {formatDate(sapt)}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      Cost săpt:{" "}
                      <span className="font-medium text-foreground tabular-nums">
                        {formatEur(cost)}
                      </span>
                    </div>
                    <WeekFormDialog
                      weekStart={sapt}
                      existing={randuri}
                      employees={employees}
                      projects={projectOptions}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground"
                        aria-label="Editează săptămâna"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </WeekFormDialog>
                    <DeleteButton
                      action={deleteWeek}
                      id={sapt}
                      confirmMessage={`Ștergi toată săptămâna din ${formatDate(sapt)}?`}
                    />
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Angajat</TableHead>
                      <TableHead>Proiect</TableHead>
                      <TableHead className="text-right">Zile</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {randuri.map((w) => (
                      <TableRow key={w.id}>
                        <TableCell className="font-medium">
                          {numeAngajat.get(w.employee_id) ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {projectNume.get(w.project_id) ?? "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{w.zile}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
