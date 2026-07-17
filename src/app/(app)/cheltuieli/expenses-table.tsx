"use client";

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
import {
  formatEur,
  formatDate,
  grupaLabel,
  grupaColor,
  categorieLabel,
  CATEGORII_PER_GRUPA,
} from "@/lib/format";
import type { ExpenseCategorie, ExpenseGrupa, ExpenseWithAlocari } from "@/lib/types";
import { ExpenseFormDialog, type ProjectOption } from "@/components/crud/expense-form-dialog";
import { DeleteButton } from "@/components/crud/delete-button";
import { useData } from "@/lib/data-context";
import {
  SortableHead,
  sortRows,
  toggleSort,
  type SortState,
} from "@/components/sortable-head";

const GRUPE: ExpenseGrupa[] = ["materiale", "deplasare", "generala", "obligatie"];
const TOATE_CATEGORIILE: ExpenseCategorie[] = GRUPE.flatMap((g) => CATEGORII_PER_GRUPA[g]);

type SortKey = "data" | "suma";

export function ExpensesTable({
  expenses,
  projects,
  projectLabels,
}: {
  expenses: ExpenseWithAlocari[];
  projects: ProjectOption[];
  projectLabels: Record<string, string>;
}) {
  const [query, setQuery] = useState("");
  const { deleteExpense } = useData();
  const [grupaFiltru, setGrupaFiltru] = useState<string>("toate");
  const [categorieFiltru, setCategorieFiltru] = useState<string>("toate");
  const [declaratFiltru, setDeclaratFiltru] = useState<string>("toate");
  const [sort, setSort] = useState<SortState<SortKey>>(null);

  // categoriile disponibile depind de grupa selectata
  const categoriiDisponibile =
    grupaFiltru === "toate"
      ? TOATE_CATEGORIILE
      : CATEGORII_PER_GRUPA[grupaFiltru as ExpenseGrupa];
  const categorieItems = {
    toate: "Toate categoriile",
    ...Object.fromEntries([...new Set(categoriiDisponibile)].map((c) => [c, categorieLabel(c)])),
  };

  const schimbaGrupa = (v: string) => {
    setGrupaFiltru(v);
    setCategorieFiltru("toate");
  };

  const q = query.trim().toLowerCase();
  const filtered = expenses.filter((e) => {
    if (grupaFiltru !== "toate" && e.grupa !== grupaFiltru) return false;
    if (categorieFiltru !== "toate" && e.categorie !== categorieFiltru) return false;
    if (declaratFiltru === "da" && !e.declarat) return false;
    if (declaratFiltru === "nu" && e.declarat) return false;
    if (!q) return true;
    const inProjects = e.alocari.some((a) =>
      (projectLabels[a.project_id] ?? "").toLowerCase().includes(q)
    );
    return (
      e.descriere.toLowerCase().includes(q) ||
      (e.furnizor?.toLowerCase().includes(q) ?? false) ||
      (e.locatie?.toLowerCase().includes(q) ?? false) ||
      grupaLabel(e.grupa).toLowerCase().includes(q) ||
      categorieLabel(e.categorie).toLowerCase().includes(q) ||
      inProjects
    );
  });

  const rows = sort
    ? sortRows(filtered, sort.dir, (e) => (sort.key === "data" ? e.data : Number(e.suma_total)))
    : filtered;
  const onToggle = (key: SortKey, firstDir: "asc" | "desc") =>
    setSort((s) => toggleSort(s, key, firstDir));

  const totalFiltrat = filtered.reduce((s, e) => s + Number(e.suma_total), 0);
  const areFiltre =
    q || grupaFiltru !== "toate" || categorieFiltru !== "toate" || declaratFiltru !== "toate";

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Lista cheltuieli</CardTitle>
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
            <Select
              value={grupaFiltru}
              onValueChange={(v) => schimbaGrupa(v ?? "toate")}
              items={{
                toate: "Toate grupele",
                ...Object.fromEntries(GRUPE.map((g) => [g, grupaLabel(g)])),
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toate">Toate grupele</SelectItem>
                {GRUPE.map((g) => (
                  <SelectItem key={g} value={g}>
                    {grupaLabel(g)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={categorieFiltru}
              onValueChange={(v) => setCategorieFiltru(v ?? "toate")}
              items={categorieItems}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categorieItems).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={declaratFiltru}
              onValueChange={(v) => setDeclaratFiltru(v ?? "toate")}
              items={{
                toate: "Toate",
                da: "Doar facturate",
                nu: "Doar nefacturate",
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="toate">Toate</SelectItem>
                <SelectItem value="da">Doar facturate</SelectItem>
                <SelectItem value="nu">Doar nefacturate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {areFiltre && (
          <p className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "rezultat" : "rezultate"} ·{" "}
            {formatEur(totalFiltrat)}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead label="Data" sortKey="data" sort={sort} onToggle={onToggle} />
              <TableHead>Grupa</TableHead>
              <TableHead>Categorie</TableHead>
              <TableHead>Descriere / furnizor</TableHead>
              <TableHead>Proiect</TableHead>
              <SortableHead label="Sumă" sortKey="suma" sort={sort} onToggle={onToggle} align="right" />
              <TableHead className="text-center">Fact.</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="text-sm whitespace-nowrap">{formatDate(e.data)}</TableCell>
                <TableCell>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${grupaColor(e.grupa)}`}>
                    {grupaLabel(e.grupa)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {categorieLabel(e.categorie)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{e.descriere}</div>
                  {e.furnizor && (
                    <div className="text-xs text-muted-foreground">{e.furnizor}</div>
                  )}
                  {e.locatie && (
                    <div className="text-xs text-purple-600">📍 {e.locatie}</div>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {e.alocari.length === 0 && <span className="text-muted-foreground">—</span>}
                  {e.alocari.length === 1 && (
                    <span>{projectLabels[e.alocari[0].project_id] ?? "—"}</span>
                  )}
                  {e.alocari.length > 1 && (
                    <div>
                      <Badge variant="secondary" className="text-xs">
                        Split: {e.alocari.length} proiecte
                      </Badge>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {e.alocari
                          .map(
                            (a) =>
                              `${(projectLabels[a.project_id] ?? "—").slice(0, 20)} ${formatEur(a.suma)}`
                          )
                          .join(" · ")}
                      </div>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatEur(Number(e.suma_total))}
                </TableCell>
                <TableCell className="text-center">
                  {e.declarat ? (
                    <Badge variant="default" className="text-xs">Da</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Nu</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <ExpenseFormDialog expense={e} clone projects={projects}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground"
                        aria-label="Duplică cheltuiala"
                        title="Duplică"
                      >
                        <Copy className="size-4" />
                      </Button>
                    </ExpenseFormDialog>
                    <ExpenseFormDialog expense={e} projects={projects}>
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
                      id={e.id}
                      confirmMessage={`Ștergi cheltuiala „${e.descriere}" (${formatEur(Number(e.suma_total))})?`}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-6">
                  {expenses.length === 0
                    ? "Nicio cheltuială încă — adaugă prima cu butonul de sus."
                    : "Nicio cheltuială găsită cu filtrele curente"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
