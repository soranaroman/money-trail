"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { useData } from "@/lib/data-context";
import type { Employee, Workday } from "@/lib/types";

type Rand = { employee_id: string; project_id: string; zile: string };

export function WeekFormDialog({
  weekStart,
  existing,
  employees,
  projects,
  children,
}: {
  /** setat = editare saptamana existenta */
  weekStart?: string;
  existing?: Workday[];
  employees: Employee[];
  projects: { id: string; label: string }[];
  children: React.ReactNode;
}) {
  const { saveWeek } = useData();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [start, setStart] = useState(weekStart ?? "");

  const randuriInitiale: Rand[] =
    existing && existing.length > 0
      ? existing.map((w) => ({
          employee_id: w.employee_id,
          project_id: w.project_id,
          zile: String(w.zile),
        }))
      : employees
          .filter((e) => e.activ)
          .map((e) => ({ employee_id: e.id, project_id: "", zile: "" }));
  const [randuri, setRanduri] = useState<Rand[]>(randuriInitiale);

  const updateRand = (idx: number, field: keyof Rand, value: string) => {
    const next = [...randuri];
    next[idx] = { ...next[idx], [field]: value };
    setRanduri(next);
  };

  function submit(formData: FormData) {
    const complete = randuri.filter((r) => r.employee_id && r.project_id && r.zile);
    formData.set("week_start", start);
    formData.set(
      "randuri",
      JSON.stringify(
        complete.map((r) => ({
          employee_id: r.employee_id,
          project_id: r.project_id,
          zile: r.zile,
        }))
      )
    );
    startTransition(async () => {
      const result = await saveWeek(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(null);
        setOpen(false);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setError(null);
      }}
    >
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {weekStart ? "Editează săptămâna" : "Săptămână nouă"}
          </DialogTitle>
          <DialogDescription>
            Rândurile fără proiect sau fără zile se ignoră. Zilele merg în pași de 0,5.
          </DialogDescription>
        </DialogHeader>

        <form action={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="wk-start">Început săptămână (luni)</Label>
            <Input
              id="wk-start"
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              disabled={!!weekStart}
              required
            />
          </div>

          <div className="space-y-2 rounded-md border bg-muted/30 p-3">
            <div className="grid grid-cols-[1fr_1fr_90px_40px] gap-2 text-xs font-medium text-muted-foreground">
              <span>Angajat</span>
              <span>Proiect</span>
              <span>Zile</span>
              <span />
            </div>
            {randuri.map((r, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_1fr_90px_40px] items-center gap-2">
                <Select
                  value={r.employee_id || null}
                  onValueChange={(v) => updateRand(idx, "employee_id", v ?? "")}
                  items={employees.map((e) => ({
                    value: e.id,
                    label: e.nume + (e.activ ? "" : " (inactiv)"),
                  }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Angajat..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.nume}
                        {!e.activ && " (inactiv)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={r.project_id || null}
                  onValueChange={(v) => updateRand(idx, "project_id", v ?? "")}
                  items={projects.map((p) => ({ value: p.id, label: p.label }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Proiect..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  placeholder="zile"
                  value={r.zile}
                  onChange={(e) => updateRand(idx, "zile", e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setRanduri(randuri.filter((_, i) => i !== idx))}
                  disabled={randuri.length <= 1}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setRanduri([...randuri, { employee_id: "", project_id: "", zile: "" }])
              }
            >
              <Plus className="mr-1 size-3" /> Adaugă rând
            </Button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Anulează
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Se salvează..." : "Salvează"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
