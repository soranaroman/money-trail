"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MapPin } from "lucide-react";
import { formatEur } from "@/lib/format";
import { useData } from "@/lib/data-context";
import { ExpenseFormDialog } from "@/components/crud/expense-form-dialog";
import { DeplasariTable } from "./deplasari-table";

export default function DeplasariPage() {
  const { expenses, projects, clients } = useData();

  const clientNume = new Map(clients.map((c) => [c.id, c.nume]));
  const projectOptions = projects.map((p) => ({
    id: p.id,
    label: `${clientNume.get(p.client_id) ?? "—"} — ${p.nume}`,
  }));
  const projectLabels = new Map(projectOptions.map((p) => [p.id, p.label]));

  const deplasari = expenses.filter((e) => e.grupa === "deplasare");

  // Raport pe localitati
  const localitati = new Map<
    string,
    { cazare: number; combustibil: number; dieta: number; total: number; nrCheltuieli: number }
  >();
  for (const d of deplasari) {
    if (!d.locatie) continue;
    const cur =
      localitati.get(d.locatie) ??
      { cazare: 0, combustibil: 0, dieta: 0, total: 0, nrCheltuieli: 0 };
    const suma = Number(d.suma_total);
    if (d.categorie === "cazare" || d.categorie === "combustibil" || d.categorie === "dieta") {
      cur[d.categorie] += suma;
    }
    cur.total += suma;
    cur.nrCheltuieli += 1;
    localitati.set(d.locatie, cur);
  }
  const localitatiSorted = [...localitati.entries()].sort((a, b) => b[1].total - a[1].total);
  const maxLoc = Math.max(...localitatiSorted.map(([, v]) => v.total), 1);

  const totalDeplasari = deplasari.reduce((s, d) => s + Number(d.suma_total), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Deplasări</h1>
          <p className="text-sm text-muted-foreground">
            {deplasari.length} {deplasari.length === 1 ? "tranzacție" : "tranzacții"} ·{" "}
            {localitati.size} {localitati.size === 1 ? "localitate" : "localități"} · Total:{" "}
            {formatEur(totalDeplasari)}
          </p>
        </div>
        <ExpenseFormDialog projects={projectOptions} defaultGrupa="deplasare">
          <Button>
            <Plus className="mr-2 size-4" />
            Adaugă deplasare
          </Button>
        </ExpenseFormDialog>
      </div>

      {/* Raport pe localitati */}
      <Card>
        <CardHeader>
          <CardTitle>Raport pe localități</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {localitatiSorted.map(([loc, v]) => (
              <div key={loc} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-purple-600" />
                    <span className="font-medium">{loc}</span>
                    <Badge variant="outline" className="text-xs">
                      {v.nrCheltuieli} {v.nrCheltuieli === 1 ? "cheltuială" : "cheltuieli"}
                    </Badge>
                  </div>
                  <div className="text-lg font-bold tabular-nums">{formatEur(v.total)}</div>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-purple-500"
                    style={{ width: `${(v.total / maxLoc) * 100}%` }}
                  />
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded bg-purple-50 px-2 py-1">
                    <div className="text-xs text-muted-foreground">Cazare</div>
                    <div className="font-medium tabular-nums">{formatEur(v.cazare)}</div>
                  </div>
                  <div className="rounded bg-amber-50 px-2 py-1">
                    <div className="text-xs text-muted-foreground">Combustibil</div>
                    <div className="font-medium tabular-nums">{formatEur(v.combustibil)}</div>
                  </div>
                  <div className="rounded bg-emerald-50 px-2 py-1">
                    <div className="text-xs text-muted-foreground">Dietă</div>
                    <div className="font-medium tabular-nums">{formatEur(v.dieta)}</div>
                  </div>
                </div>
              </div>
            ))}
            {localitatiSorted.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nicio deplasare cu localitate încă — raportul se construiește automat.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista deplasari — filtre + sortare + clonare */}
      <DeplasariTable
        deplasari={deplasari}
        projects={projectOptions}
        projectLabels={Object.fromEntries(projectLabels)}
        localitati={localitatiSorted.map(([loc]) => loc)}
      />
    </div>
  );
}
