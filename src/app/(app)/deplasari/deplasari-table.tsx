"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Copy, MapPin, Pencil, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatEur, formatDate, categorieLabel } from "@/lib/format";
import type { ExpenseWithAlocari } from "@/lib/types";
import { ExpenseFormDialog, type ProjectOption } from "@/components/crud/expense-form-dialog";
import { DeleteButton } from "@/components/crud/delete-button";
import { useData } from "@/lib/data-context";
import {
  SortableHead,
  sortRows,
  toggleSort,
  type SortState,
} from "@/components/sortable-head";

const categColor: Record<string, string> = {
  cazare: "bg-purple-100 text-purple-700",
  combustibil: "bg-amber-100 text-amber-700",
  dieta: "bg-emerald-100 text-emerald-700",
};

type SortKey = "data" | "suma";

export function DeplasariTable({
  deplasari,
  projects,
  projectLabels,
  localitati,
}: {
  deplasari: ExpenseWithAlocari[];
  projects: ProjectOption[];
  projectLabels: Record<string, string>;
  localitati: string[];
}) {
  const [query, setQuery] = useState("");
  const { deleteExpense } = useData();
  const [locFiltru, setLocFiltru] = useState<string>("toate");
  const [categFiltru, setCategFiltru] = useState<string>("toate");
  const [sort, setSort] = useState<SortState<SortKey>>(null);

  const q = query.trim().toLowerCase();
  const filtered = deplasari.filter((d) => {
    if (locFiltru !== "toate" && d.locatie !== locFiltru) return false;
    if (categFiltru !== "toate" && d.categorie !== categFiltru) return false;
    if (!q) return true;
    return (
      d.descriere.toLowerCase().includes(q) ||
      (d.furnizor?.toLowerCase().includes(q) ?? false) ||
      (d.locatie?.toLowerCase().includes(q) ?? false)
    );
  });

  const rows = sort
    ? sortRows(filtered, sort.dir, (d) => (sort.key === "data" ? d.data : Number(d.suma_total)))
    : filtered;
  const onToggle = (key: SortKey, firstDir: "asc" | "desc") =>
    setSort((s) => toggleSort(s, key, firstDir));

  const locItems = {
    toate: "Toate localitățile",
    ...Object.fromEntries(localitati.map((l) => [l, l])),
  };
  const categItems = {
    toate: "Toate categoriile",
    cazare: categorieLabel("cazare"),
    combustibil: categorieLabel("combustibil"),
    dieta: categorieLabel("dieta"),
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Toate cheltuielile de deplasare</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Caută..."
                className="w-48 pl-8"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Select value={locFiltru} onValueChange={(v) => setLocFiltru(v ?? "toate")} items={locItems}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(locItems).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categFiltru} onValueChange={(v) => setCategFiltru(v ?? "toate")} items={categItems}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categItems).map(([value, label]) => (
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
              <SortableHead label="Data" sortKey="data" sort={sort} onToggle={onToggle} />
              <TableHead>Categorie</TableHead>
              <TableHead>Locație</TableHead>
              <TableHead>Descriere</TableHead>
              <TableHead>Proiect</TableHead>
              <SortableHead label="Sumă" sortKey="suma" sort={sort} onToggle={onToggle} align="right" />
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="text-sm whitespace-nowrap">{formatDate(d.data)}</TableCell>
                <TableCell>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${categColor[d.categorie] ?? "bg-muted text-muted-foreground"}`}>
                    {categorieLabel(d.categorie)}
                  </span>
                </TableCell>
                <TableCell>
                  {d.locatie ? (
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="size-3 text-muted-foreground" />
                      {d.locatie}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {d.descriere}
                  {d.furnizor && (
                    <div className="text-xs text-muted-foreground">{d.furnizor}</div>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {d.alocari.length === 0 && "—"}
                  {d.alocari.length === 1 && (projectLabels[d.alocari[0].project_id] ?? "—")}
                  {d.alocari.length > 1 && `Split: ${d.alocari.length} proiecte`}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatEur(Number(d.suma_total))}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <ExpenseFormDialog expense={d} clone projects={projects}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground"
                        aria-label="Duplică deplasarea"
                        title="Duplică"
                      >
                        <Copy className="size-4" />
                      </Button>
                    </ExpenseFormDialog>
                    <ExpenseFormDialog expense={d} projects={projects}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground"
                        aria-label="Editează"
                        title="Editează"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </ExpenseFormDialog>
                    <DeleteButton
                      action={deleteExpense}
                      id={d.id}
                      confirmMessage={`Ștergi cheltuiala „${d.descriere}" (${formatEur(Number(d.suma_total))})?`}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-6">
                  {deplasari.length === 0
                    ? "Nicio deplasare încă — adaugă prima cu butonul de sus."
                    : "Nicio deplasare găsită cu filtrele curente"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
