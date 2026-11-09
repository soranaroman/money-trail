"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatEur, grupaLabel, categorieLabel, CATEGORII_PER_GRUPA } from "@/lib/format";
import { useData } from "@/lib/data-context";
import type { ExpenseGrupa, ExpenseWithAlocari } from "@/lib/types";

type AsociereMode = "none" | "single" | "split";

export type ProjectOption = { id: string; label: string };

export function ExpenseFormDialog({
  expense,
  clone = false,
  projects,
  defaultProjectId,
  defaultGrupa,
  children,
}: {
  expense?: ExpenseWithAlocari;
  /** true = foloseste `expense` doar ca prefill si salveaza ca inregistrare NOUA */
  clone?: boolean;
  projects: ProjectOption[];
  defaultProjectId?: string;
  defaultGrupa?: ExpenseGrupa;
  children: React.ReactNode;
}) {
  const isEdit = !!expense && !clone;
  const { saveExpense } = useData();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [grupa, setGrupa] = useState<ExpenseGrupa>(expense?.grupa ?? defaultGrupa ?? "materiale");
  const [categorie, setCategorie] = useState<string>(expense?.categorie ?? "");
  const [sumaTotala, setSumaTotala] = useState<string>(
    expense ? String(expense.suma_total) : ""
  );
  const initialMode: AsociereMode = expense
    ? expense.alocari.length === 0
      ? "none"
      : expense.alocari.length === 1
        ? "single"
        : "split"
    : defaultProjectId
      ? "single"
      : "single";
  const [asociereMode, setAsociereMode] = useState<AsociereMode>(initialMode);
  const [singleProjectId, setSingleProjectId] = useState<string>(
    expense?.alocari[0]?.project_id ?? defaultProjectId ?? ""
  );
  const [alocari, setAlocari] = useState<{ project_id: string; suma: string }[]>(
    expense && expense.alocari.length > 1
      ? expense.alocari.map((a) => ({ project_id: a.project_id, suma: String(a.suma) }))
      : [
          { project_id: "", suma: "" },
          { project_id: "", suma: "" },
        ]
  );

  const total = parseFloat(sumaTotala.replace(",", ".")) || 0;
  const totalAlocat = alocari.reduce(
    (s, a) => s + (parseFloat(a.suma.replace(",", ".")) || 0),
    0
  );
  const echilibrat = Math.abs(total - totalAlocat) < 0.01 && total > 0;

  // grupele generala/obligatie nu se aloca pe proiecte
  const faraAsociere = grupa === "generala" || grupa === "obligatie";

  const updateAlocare = (idx: number, field: "project_id" | "suma", value: string) => {
    const next = [...alocari];
    next[idx] = { ...next[idx], [field]: value };
    setAlocari(next);
  };

  function submit(formData: FormData) {
    // alocarile finale, in functie de modul ales
    let alocariFinale: { project_id: string; suma: number }[] = [];
    if (!faraAsociere) {
      if (asociereMode === "single" && singleProjectId) {
        alocariFinale = [{ project_id: singleProjectId, suma: total }];
      } else if (asociereMode === "split") {
        alocariFinale = alocari
          .filter((a) => a.project_id || a.suma)
          .map((a) => ({
            project_id: a.project_id,
            suma: parseFloat(a.suma.replace(",", ".")) || 0,
          }));
      }
    }
    formData.set("alocari", JSON.stringify(alocariFinale));
    formData.set("grupa", grupa);

    startTransition(async () => {
      const result = await saveExpense(formData);
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
          <DialogTitle>{isEdit ? "Editează cheltuială" : "Cheltuială nouă"}</DialogTitle>
        </DialogHeader>

        <form action={submit} className="space-y-4">
          {isEdit && expense && <input type="hidden" name="id" value={expense.id} />}

          {/* Data + furnizor */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ex-data">Data</Label>
              <Input
                id="ex-data"
                name="data"
                type="date"
                defaultValue={clone ? new Date().toISOString().slice(0, 10) : expense?.data}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ex-furnizor">Furnizor (opțional)</Label>
              <Input
                id="ex-furnizor"
                name="furnizor"
                defaultValue={expense?.furnizor ?? ""}
                placeholder="ex: Vidrios Albatros, Repsol..."
              />
            </div>
          </div>

          {/* Grupa */}
          <div className="space-y-1.5">
            <Label>Grupa</Label>
            <RadioGroup
              value={grupa}
              onValueChange={(v) => {
                setGrupa(v as ExpenseGrupa);
                setCategorie("");
              }}
              className="grid grid-cols-2 gap-2 md:grid-cols-4"
            >
              {(Object.keys(CATEGORII_PER_GRUPA) as ExpenseGrupa[]).map((g) => (
                <Label
                  key={g}
                  htmlFor={`g-${g}`}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm",
                    grupa === g && "border-foreground bg-muted"
                  )}
                >
                  <RadioGroupItem value={g} id={`g-${g}`} />
                  {grupaLabel(g)}
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Categorie + locatie */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Categorie</Label>
              <Select
                key={grupa}
                name="categorie"
                value={categorie || null}
                onValueChange={(v) => setCategorie(v ?? "")}
                items={CATEGORII_PER_GRUPA[grupa].map((c) => ({
                  value: c,
                  label: categorieLabel(c),
                }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selectează..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORII_PER_GRUPA[grupa].map((c) => (
                    <SelectItem key={c} value={c}>
                      {categorieLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {grupa === "deplasare" && (
              <div className="space-y-1.5">
                <Label htmlFor="ex-locatie">Locație</Label>
                <Input
                  id="ex-locatie"
                  name="locatie"
                  defaultValue={expense?.locatie ?? ""}
                  placeholder="ex: Bilbao, Murcia"
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ex-descriere">Descriere</Label>
            <Input
              id="ex-descriere"
              name="descriere"
              defaultValue={expense?.descriere}
              placeholder="ex: Sticlă 6.6, comandă Vidrios Albatros"
              required
            />
          </div>

          {/* Suma + declarat */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ex-suma">Sumă totală (€)</Label>
              <Input
                id="ex-suma"
                name="suma_total"
                type="number"
                step="0.01"
                min="0.01"
                value={sumaTotala}
                onChange={(e) => setSumaTotala(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Facturat</Label>
              <RadioGroup
                name="declarat"
                defaultValue={expense ? (expense.declarat ? "da" : "nu") : "da"}
                className="flex gap-3 pt-1.5"
              >
                <Label htmlFor="ex-d-da" className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="da" id="ex-d-da" /> Da (cu factură)
                </Label>
                <Label htmlFor="ex-d-nu" className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="nu" id="ex-d-nu" /> Nu (fără factură)
                </Label>
              </RadioGroup>
            </div>
          </div>

          {/* Asociere proiect */}
          {!faraAsociere && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label>Asociere proiect</Label>
                <RadioGroup
                  value={asociereMode}
                  onValueChange={(v) => setAsociereMode(v as AsociereMode)}
                  className="flex flex-wrap gap-3"
                >
                  <Label htmlFor="m-none" className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="none" id="m-none" /> Fără proiect
                  </Label>
                  <Label htmlFor="m-single" className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="single" id="m-single" /> Un singur proiect
                  </Label>
                  <Label htmlFor="m-split" className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="split" id="m-split" /> Împarte între mai multe
                  </Label>
                </RadioGroup>

                {asociereMode === "single" && (
                  <Select
                    value={singleProjectId || null}
                    onValueChange={(v) => setSingleProjectId(v ?? "")}
                    items={projects.map((p) => ({ value: p.id, label: p.label }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selectează proiect..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {asociereMode === "split" && (
                  <div className="space-y-2 rounded-md border bg-muted/30 p-3">
                    <div className="text-xs font-medium">Alocări către proiecte:</div>
                    {alocari.map((al, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr_120px_40px] gap-2">
                        <Select
                          value={al.project_id || null}
                          onValueChange={(v) => updateAlocare(idx, "project_id", v ?? "")}
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
                          step="0.01"
                          placeholder="€"
                          value={al.suma}
                          onChange={(e) => updateAlocare(idx, "suma", e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setAlocari(alocari.filter((_, i) => i !== idx))}
                          disabled={alocari.length <= 1}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAlocari([...alocari, { project_id: "", suma: "" }])}
                    >
                      <Plus className="mr-1 size-3" /> Adaugă proiect
                    </Button>
                    <div className="mt-3 flex items-center justify-between rounded border bg-background p-2 text-sm">
                      <span>
                        Total alocat:{" "}
                        <span className="font-medium tabular-nums">{formatEur(totalAlocat)}</span>
                        {" / Suma totală: "}
                        <span className="font-medium tabular-nums">{formatEur(total)}</span>
                      </span>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          echilibrat ? "text-emerald-600" : "text-amber-600"
                        )}
                      >
                        {echilibrat
                          ? "✓ Echilibrat"
                          : total === 0
                            ? "Introdu suma totală"
                            : `Dezechilibru: ${formatEur(total - totalAlocat)}`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

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
