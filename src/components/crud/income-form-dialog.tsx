"use client";

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
import { FormDialog } from "@/components/crud/form-dialog";
import { useData } from "@/lib/data-context";
import type { Income } from "@/lib/types";

export function IncomeFormDialog({
  income,
  clone = false,
  projects,
  defaultProjectId,
  children,
}: {
  income?: Income;
  /** true = foloseste `income` doar ca prefill si salveaza ca incasare NOUA */
  clone?: boolean;
  /** id + eticheta afisata (nume client — nume proiect) */
  projects: { id: string; label: string }[];
  defaultProjectId?: string;
  children: React.ReactNode;
}) {
  const { saveIncome } = useData();
  return (
    <FormDialog
      title={income && !clone ? "Editează încasare" : "Încasare nouă"}
      action={saveIncome}
      body={
        <>
          {income && !clone && <input type="hidden" name="id" value={income.id} />}
          <div className="space-y-1.5">
            <Label>Proiect</Label>
            <Select
              name="project_id"
              defaultValue={income?.project_id ?? defaultProjectId}
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
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="in-suma">Sumă (€)</Label>
              <Input
                id="in-suma"
                name="suma"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={income?.suma}
                placeholder="0,00"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="in-data">Data</Label>
              <Input
                id="in-data"
                name="data"
                type="date"
                defaultValue={clone ? new Date().toISOString().slice(0, 10) : income?.data}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tip</Label>
              <Select
                name="tip"
                defaultValue={income?.tip ?? "avans"}
                items={{ avans: "Avans", transa: "Tranșă", final: "Plată finală" }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selectează..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="avans">Avans</SelectItem>
                  <SelectItem value="transa">Tranșă</SelectItem>
                  <SelectItem value="final">Plată finală</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Mod plată</Label>
              <Select
                name="mod_plata"
                defaultValue={income?.mod_plata ?? "TB"}
                items={{ TB: "Transfer bancar", Cash: "Cash" }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selectează..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TB">Transfer bancar</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Facturat</Label>
            <RadioGroup
              name="declarat"
              defaultValue={income ? (income.declarat ? "da" : "nu") : "da"}
              className="flex gap-4 pt-1"
            >
              <Label htmlFor="in-da" className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="da" id="in-da" /> Da (cu factură)
              </Label>
              <Label htmlFor="in-nu" className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="nu" id="in-nu" /> Nu (fără factură)
              </Label>
            </RadioGroup>
          </div>
        </>
      }
    >
      {children}
    </FormDialog>
  );
}
