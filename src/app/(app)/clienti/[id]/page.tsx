"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
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
import { ArrowLeft, Pencil } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { formatEur, formatDate, statusLabel, statusColor } from "@/lib/format";
import { useData } from "@/lib/data-context";
import { costByProject as costByProjectFn, incasatByProject as incasatByProjectFn } from "@/lib/derive";
import { ClientFormDialog } from "@/components/crud/client-form-dialog";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { clients, projects, incomes, expenses, workdays, employees } = useData();
  const client = clients.find((c) => c.id === id);
  if (!client) notFound();

  const incasatByProject = incasatByProjectFn(incomes);
  const costByProject = costByProjectFn(expenses, workdays, employees);
  const proiecteRaw = projects.filter((p) => p.client_id === client.id);

  const proiecte = proiecteRaw.map((p) => {
    const oferta = Number(p.oferta_total);
    const incasat = incasatByProject.get(p.id) ?? 0;
    const cost = costByProject.get(p.id) ?? 0;
    const profit = oferta - cost;
    const marja = oferta > 0 ? (profit / oferta) * 100 : 0;
    return { ...p, oferta, incasat, cost, profit, marja, rest: oferta - incasat };
  });

  const totalOferte = proiecte.reduce((s, p) => s + p.oferta, 0);
  const totalIncasat = proiecte.reduce((s, p) => s + p.incasat, 0);
  const totalRest = totalOferte - totalIncasat;
  const totalProfit = proiecte.reduce((s, p) => s + p.profit, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" render={<Link href="/clienti" />}>
          <ArrowLeft className="mr-1 size-4" />
          Înapoi la clienți
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{client.nume}</h1>
            {client.tip === "general_contractor" ? (
              <Badge variant="secondary">General contractor</Badge>
            ) : (
              <Badge variant="outline">Direct</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {client.email ?? "Fără email"}
            {" · "}
            {proiecte.length} {proiecte.length === 1 ? "proiect" : "proiecte"}
          </p>
        </div>
        <ClientFormDialog client={client}>
          <Button variant="outline" size="sm">
            <Pencil className="mr-1 size-3" />
            Editează
          </Button>
        </ClientFormDialog>
      </div>

      {/* KPI-uri */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KpiCard label="Total oferte" value={formatEur(totalOferte)} />
        <KpiCard label="Încasat" value={formatEur(totalIncasat)} />
        <KpiCard
          label="Rest de plată"
          value={formatEur(totalRest)}
          subtitle={totalRest > 0 ? "de încasat" : "achitat integral"}
        />
        <KpiCard label="Profit estimat" value={formatEur(totalProfit)} />
      </div>

      {/* Proiecte */}
      <Card>
        <CardHeader>
          <CardTitle>Proiecte</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proiect</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ofertă</TableHead>
                <TableHead className="text-right">Încasat</TableHead>
                <TableHead className="text-right">Rest</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Marjă</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proiecte.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link
                      href={`/proiecte/${p.id}`}
                      className="font-medium hover:underline"
                    >
                      {p.nume}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {p.locatie}
                      {p.client_final && ` · ${p.client_final}`}
                      {" · "}
                      {formatDate(p.data_start)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(p.status)}`}>
                      {statusLabel(p.status)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatEur(p.oferta)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatEur(p.incasat)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {p.rest > 0 ? (
                      <span className="text-amber-600 font-medium">{formatEur(p.rest)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className={p.profit > 0 ? "text-emerald-600" : "text-rose-600"}>
                      {formatEur(p.profit)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <Badge variant={p.marja >= 20 ? "default" : p.marja >= 10 ? "secondary" : "destructive"}>
                      {p.marja.toFixed(0)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {proiecte.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-6">
                    Niciun proiect asociat acestui client
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
