"use client";

import Link from "next/link";
import { useState } from "react";
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
import { Copy, Pencil, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatEur, formatDate, statusLabel, statusColor } from "@/lib/format";
import type { Client, Project, ProjectStatus } from "@/lib/types";
import { ProjectFormDialog } from "@/components/crud/project-form-dialog";
import {
  SortableHead,
  sortRows,
  toggleSort,
  type SortState,
} from "@/components/sortable-head";

export type ProjectRow = Project & {
  clientNume: string;
  cheltuieli: number;
  profit: number;
  marja: number;
};

type SortKey = "nume" | "oferta_total" | "cheltuieli" | "profit" | "marja";

const STATUSURI: ProjectStatus[] = ["oferta", "in_lucru", "finalizat", "garantie"];

export function ProjectsTable({
  projects,
  clients,
}: {
  projects: ProjectRow[];
  clients: Pick<Client, "id" | "nume">[];
}) {
  const [query, setQuery] = useState("");
  const [statusFiltru, setStatusFiltru] = useState<string>("toate");
  const [clientFiltru, setClientFiltru] = useState<string>("toti");
  const [sort, setSort] = useState<SortState<SortKey>>(null);

  const q = query.trim().toLowerCase();
  const filtered = projects.filter((p) => {
    if (statusFiltru !== "toate" && p.status !== statusFiltru) return false;
    if (clientFiltru !== "toti" && p.client_id !== clientFiltru) return false;
    if (!q) return true;
    return (
      p.nume.toLowerCase().includes(q) ||
      p.locatie.toLowerCase().includes(q) ||
      (p.client_final?.toLowerCase().includes(q) ?? false) ||
      p.clientNume.toLowerCase().includes(q)
    );
  });

  const rows = sort
    ? sortRows(filtered, sort.dir, (p) =>
        sort.key === "oferta_total" ? Number(p.oferta_total) : p[sort.key]
      )
    : filtered;
  const onToggle = (key: SortKey, firstDir: "asc" | "desc") =>
    setSort((s) => toggleSort(s, key, firstDir));

  const statusItems = {
    toate: "Toate statusurile",
    ...Object.fromEntries(STATUSURI.map((s) => [s, statusLabel(s)])),
  };
  const clientItems = {
    toti: "Toți clienții",
    ...Object.fromEntries(clients.map((c) => [c.id, c.nume])),
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Lista proiecte</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Caută proiect..."
                className="w-56 pl-8"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Select
              value={statusFiltru}
              onValueChange={(v) => setStatusFiltru(v ?? "toate")}
              items={statusItems}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusItems).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={clientFiltru}
              onValueChange={(v) => setClientFiltru(v ?? "toti")}
              items={clientItems}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(clientItems).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {(q || statusFiltru !== "toate" || clientFiltru !== "toti") && (
          <p className="text-sm text-muted-foreground">
            {rows.length} {rows.length === 1 ? "rezultat" : "rezultate"}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead label="Proiect" sortKey="nume" sort={sort} onToggle={onToggle} firstDir="asc" />
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <SortableHead label="Ofertă" sortKey="oferta_total" sort={sort} onToggle={onToggle} align="right" />
              <SortableHead label="Cost real" sortKey="cheltuieli" sort={sort} onToggle={onToggle} align="right" />
              <SortableHead label="Profit" sortKey="profit" sort={sort} onToggle={onToggle} align="right" />
              <SortableHead label="Marjă" sortKey="marja" sort={sort} onToggle={onToggle} align="right" />
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
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
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{p.clientNume}</span>
                  <div className="text-xs text-muted-foreground">{formatDate(p.data_start)}</div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(p.status)}`}>
                    {statusLabel(p.status)}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatEur(Number(p.oferta_total))}</TableCell>
                <TableCell className="text-right tabular-nums">{formatEur(p.cheltuieli)}</TableCell>
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
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <ProjectFormDialog project={p} clone clients={clients}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground"
                        aria-label="Duplică proiectul"
                        title="Duplică"
                      >
                        <Copy className="size-4" />
                      </Button>
                    </ProjectFormDialog>
                    <ProjectFormDialog project={p} clients={clients}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground"
                        aria-label="Editează"
                        title="Editează"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </ProjectFormDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-6">
                  {projects.length === 0
                    ? "Niciun proiect încă — adaugă primul cu butonul de sus."
                    : "Niciun proiect găsit cu filtrele curente"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
