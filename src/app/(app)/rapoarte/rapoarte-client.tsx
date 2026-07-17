"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, FileSpreadsheet } from "lucide-react";
import { DeclaratToggle, type DeclaratFilter } from "@/components/declarat-toggle";
import { formatEur, grupaLabel, categorieLabel } from "@/lib/format";
import { monthRange, prevQuarterRange, quarterRange } from "@/lib/periods";
import { cn } from "@/lib/utils";
import type { ExpenseCategorie, ExpenseGrupa } from "@/lib/types";

export type RaportProject = {
  id: string;
  nume: string;
  locatie: string;
  clientNume: string;
  oferta_total: number;
  data_start: string;
};
/** o alocare de cheltuiala catre un proiect, cu atributele cheltuielii-parinte */
export type RaportAlloc = {
  project_id: string;
  suma: number;
  grupa: ExpenseGrupa;
  categorie: ExpenseCategorie;
  declarat: boolean;
};
/** cheltuiala fara nicio alocare (generale, obligatii etc.) */
export type RaportNeatasata = {
  id: string;
  descriere: string;
  grupa: ExpenseGrupa;
  categorie: ExpenseCategorie;
  suma: number;
  declarat: boolean;
};

type Period = "cur" | "prev" | "luna" | "tot";

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob(["﻿", content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function RapoarteClient({
  projects,
  allocs,
  neatasate,
  manoperaPerProject,
  today,
}: {
  projects: RaportProject[];
  allocs: RaportAlloc[];
  neatasate: RaportNeatasata[];
  manoperaPerProject: Record<string, number>;
  today: string;
}) {
  const [declarat, setDeclarat] = useState<DeclaratFilter>("tot");
  const [period, setPeriod] = useState<Period>("tot");

  const qCur = quarterRange(today);
  const qPrev = prevQuarterRange(today);
  const luna = monthRange(today);
  const periodOptions: { value: Period; label: string; range: { start: string; end: string } | null }[] = [
    { value: "cur", label: qCur.label, range: qCur },
    { value: "prev", label: qPrev.label, range: qPrev },
    { value: "luna", label: "Luna asta", range: luna },
    { value: "tot", label: "Tot", range: null },
  ];

  const matchDeclarat = (d: boolean) => declarat === "tot" || d === (declarat === "declarat");

  const range = periodOptions.find((o) => o.value === period)?.range ?? null;
  const periodProjects = range
    ? projects.filter((p) => p.data_start >= range.start && p.data_start <= range.end)
    : projects;

  // Per proiect: detaliere costuri
  const rows = periodProjects.map((p) => {
    const exps = allocs.filter((a) => a.project_id === p.id && matchDeclarat(a.declarat));
    const materiale = exps
      .filter((x) => x.categorie === "principal" || x.categorie === "auxiliar")
      .reduce((s, x) => s + x.suma, 0);
    const neprev = exps.filter((x) => x.categorie === "neprevazut").reduce((s, x) => s + x.suma, 0);
    const pierderi = exps.filter((x) => x.categorie === "pierdere").reduce((s, x) => s + x.suma, 0);
    const deplasari = exps.filter((x) => x.grupa === "deplasare").reduce((s, x) => s + x.suma, 0);
    const manopera = manoperaPerProject[p.id] ?? 0;
    const costTotal = exps.reduce((s, x) => s + x.suma, 0) + manopera;
    const profit = p.oferta_total - costTotal;
    const marja = p.oferta_total > 0 ? (profit / p.oferta_total) * 100 : 0;
    return { project: p, materiale, neprev, pierderi, deplasari, manopera, costTotal, profit, marja };
  });

  // Totaluri
  const totalOferte = rows.reduce((s, r) => s + r.project.oferta_total, 0);
  const totalProfit = rows.reduce((s, r) => s + r.profit, 0);
  const totalCostTotal = rows.reduce((s, r) => s + r.costTotal, 0);
  const marjaTotala = totalOferte > 0 ? (totalProfit / totalOferte) * 100 : 0;

  // Cheltuieli neatasate de proiect (generale firma, obligatii, neasociate)
  const generale = neatasate.filter((e) => matchDeclarat(e.declarat));
  const totalGenerale = generale.reduce((s, e) => s + e.suma, 0);

  const periodLabel = periodOptions.find((o) => o.value === period)?.label ?? "";

  const buildExportRows = () => {
    const header = [
      "Proiect", "Client", "Locatie", "Oferta", "Materiale", "Neprevazut", "Pierderi",
      "Deplasari", "Manopera", "Cost total", "Profit", "Marja %",
    ];
    const body = rows.map((r) => [
      r.project.nume, r.project.clientNume, r.project.locatie, r.project.oferta_total,
      r.materiale, r.neprev, r.pierderi, r.deplasari, r.manopera,
      r.costTotal, r.profit, r.marja.toFixed(1),
    ]);
    const total = [
      "TOTAL", "", "", totalOferte, "", "", "", "", "", totalCostTotal, totalProfit, marjaTotala.toFixed(1),
    ];
    return { header, body: [...body, total] };
  };

  const handleExportCsv = () => {
    const { header, body } = buildExportRows();
    const csv = [header, ...body]
      .map((r) =>
        r
          .map((cell) => {
            const s = String(cell);
            return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(";")
      )
      .join("\n");
    downloadFile(`raport-${periodLabel.replace(/\s/g, "-").toLowerCase()}.csv`, csv, "text/csv;charset=utf-8");
  };

  const handleExportExcel = () => {
    const { header, body } = buildExportRows();
    const esc = (v: unknown) =>
      String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const html = `<table border="1"><thead><tr>${header
      .map((h) => `<th>${esc(h)}</th>`)
      .join("")}</tr></thead><tbody>${body
      .map((r) => `<tr>${r.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`)
      .join("")}</tbody></table>`;
    downloadFile(
      `raport-${periodLabel.replace(/\s/g, "-").toLowerCase()}.xls`,
      html,
      "application/vnd.ms-excel"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rapoarte</h1>
          <p className="text-sm text-muted-foreground">
            Defalcare costuri per proiect și export pentru analiză externă
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DeclaratToggle value={declarat} onChange={setDeclarat} />
          <Button variant="outline" onClick={handleExportCsv}>
            <Download className="mr-2 size-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="mr-2 size-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filtre */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-medium">Perioadă:</span>
            <div className="inline-flex rounded-md border bg-muted/50 p-0.5">
              {periodOptions.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setPeriod(o.value)}
                  className={cn(
                    "rounded px-3 py-1 transition-colors",
                    period === o.value
                      ? "bg-background font-medium shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {rows.length} {rows.length === 1 ? "proiect" : "proiecte"} · {periodLabel} (după
              data de start)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Defalcare per proiect */}
      <Card>
        <CardHeader>
          <CardTitle>Defalcare costuri per proiect</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proiect</TableHead>
                <TableHead className="text-right">Ofertă</TableHead>
                <TableHead className="text-right">Materiale</TableHead>
                <TableHead className="text-right">Neprev.</TableHead>
                <TableHead className="text-right">Pierderi</TableHead>
                <TableHead className="text-right">Deplasări</TableHead>
                <TableHead className="text-right">Manoperă</TableHead>
                <TableHead className="text-right">Cost total</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Marjă</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.project.id}>
                  <TableCell className="text-sm">
                    <div className="font-medium">
                      {r.project.nume.slice(0, 28)}
                      {r.project.nume.length > 28 ? "…" : ""}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {r.project.clientNume} · {r.project.locatie}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatEur(r.project.oferta_total)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatEur(r.materiale)}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.neprev > 0 ? formatEur(r.neprev) : "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.pierderi > 0 ? formatEur(r.pierderi) : "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.deplasari > 0 ? formatEur(r.deplasari) : "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatEur(r.manopera)}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">{formatEur(r.costTotal)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className={r.profit > 0 ? "text-emerald-600" : "text-rose-600"}>
                      {formatEur(r.profit)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <Badge variant={r.marja >= 20 ? "default" : r.marja >= 10 ? "secondary" : "destructive"}>
                      {r.marja.toFixed(0)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-sm text-muted-foreground py-6">
                    Niciun proiect în perioada selectată
                  </TableCell>
                </TableRow>
              )}
              {rows.length > 0 && (
                <TableRow className="bg-muted/30 font-medium">
                  <TableCell>Total {periodLabel}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatEur(totalOferte)}</TableCell>
                  <TableCell colSpan={5} />
                  <TableCell className="text-right tabular-nums">{formatEur(totalCostTotal)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatEur(totalProfit)}</TableCell>
                  <TableCell className="text-right tabular-nums">{marjaTotala.toFixed(1)}%</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Neatasate de proiect */}
      <Card>
        <CardHeader>
          <CardTitle>Cheltuieli neatașate de proiect (generale, obligații)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descriere</TableHead>
                <TableHead>Grupă</TableHead>
                <TableHead>Categorie</TableHead>
                <TableHead className="text-right">Sumă</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {generale.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="text-sm">{g.descriere}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{grupaLabel(g.grupa)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{categorieLabel(g.categorie)}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatEur(g.suma)}</TableCell>
                </TableRow>
              ))}
              {generale.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground py-6">
                    Nicio cheltuială neatașată
                  </TableCell>
                </TableRow>
              )}
              {generale.length > 0 && (
                <TableRow className="bg-muted/30 font-medium">
                  <TableCell colSpan={3}>Total neatașate</TableCell>
                  <TableCell className="text-right tabular-nums">{formatEur(totalGenerale)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="mt-3 rounded-md bg-muted/30 p-3 text-sm">
            <span className="font-medium">Profit net firmă: </span>
            <span
              className={cn(
                "tabular-nums font-bold",
                totalProfit - totalGenerale >= 0 ? "text-emerald-700" : "text-rose-600"
              )}
            >
              {formatEur(totalProfit - totalGenerale)}
            </span>
            <span className="ml-2 text-xs text-muted-foreground">
              (profit proiecte − cheltuieli neatașate)
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
