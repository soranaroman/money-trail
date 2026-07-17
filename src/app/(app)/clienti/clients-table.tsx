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
import { Pencil, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatEur } from "@/lib/format";
import type { Client } from "@/lib/types";
import { ClientFormDialog } from "@/components/crud/client-form-dialog";
import { DeleteButton } from "@/components/crud/delete-button";
import { useData } from "@/lib/data-context";
import {
  SortableHead,
  sortRows,
  toggleSort,
  type SortState,
} from "@/components/sortable-head";

export type ClientWithStats = Client & {
  nrProiecte: number;
  totalOferte: number;
  totalIncasat: number;
  restDePlata: number;
};

type SortKey = "nume" | "nrProiecte" | "totalOferte" | "totalIncasat" | "restDePlata";

const TIP_ITEMS = {
  toate: "Toate tipurile",
  direct: "Direct",
  general_contractor: "General contractor",
};

export function ClientsTable({ clients }: { clients: ClientWithStats[] }) {
  const { deleteClient } = useData();
  const [query, setQuery] = useState("");
  const [tipFiltru, setTipFiltru] = useState<string>("toate");
  const [sort, setSort] = useState<SortState<SortKey>>(null);

  const q = query.trim().toLowerCase();
  const filtered = clients.filter((c) => {
    if (tipFiltru !== "toate" && c.tip !== tipFiltru) return false;
    if (!q) return true;
    return c.nume.toLowerCase().includes(q) || (c.email?.toLowerCase().includes(q) ?? false);
  });

  const rows = sort ? sortRows(filtered, sort.dir, (c) => c[sort.key]) : filtered;
  const onToggle = (key: SortKey, firstDir: "asc" | "desc") =>
    setSort((s) => toggleSort(s, key, firstDir));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Lista clienți</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Caută client..."
                className="w-56 pl-8"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Select
              value={tipFiltru}
              onValueChange={(v) => setTipFiltru(v ?? "toate")}
              items={TIP_ITEMS}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIP_ITEMS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead label="Nume" sortKey="nume" sort={sort} onToggle={onToggle} firstDir="asc" />
              <TableHead>Tip</TableHead>
              <SortableHead label="Proiecte" sortKey="nrProiecte" sort={sort} onToggle={onToggle} align="right" />
              <SortableHead label="Total oferte" sortKey="totalOferte" sort={sort} onToggle={onToggle} align="right" />
              <SortableHead label="Încasat" sortKey="totalIncasat" sort={sort} onToggle={onToggle} align="right" />
              <SortableHead label="Rest de plată" sortKey="restDePlata" sort={sort} onToggle={onToggle} align="right" />
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Link
                    href={`/clienti/${c.id}`}
                    className="font-medium hover:underline"
                  >
                    {c.nume}
                  </Link>
                  {c.email && (
                    <div className="text-xs text-muted-foreground">{c.email}</div>
                  )}
                </TableCell>
                <TableCell>
                  {c.tip === "general_contractor" ? (
                    <Badge variant="secondary">General contractor</Badge>
                  ) : (
                    <Badge variant="outline">Direct</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">{c.nrProiecte}</TableCell>
                <TableCell className="text-right tabular-nums">{formatEur(c.totalOferte)}</TableCell>
                <TableCell className="text-right tabular-nums">{formatEur(c.totalIncasat)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {c.restDePlata > 0 ? (
                    <span className="text-amber-600 font-medium">{formatEur(c.restDePlata)}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <ClientFormDialog client={c}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground"
                        aria-label="Editează"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </ClientFormDialog>
                    <DeleteButton
                      action={deleteClient}
                      id={c.id}
                      confirmMessage={`Ștergi clientul „${c.nume}"?`}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-6">
                  {clients.length === 0
                    ? "Niciun client încă — adaugă primul cu butonul de sus."
                    : "Niciun client găsit cu filtrele curente"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
