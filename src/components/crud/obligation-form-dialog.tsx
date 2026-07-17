"use client";

import { useState } from "react";
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
import type { Obligation } from "@/lib/types";

const RECURENTA_ITEMS = {
  lunar: "Lunar",
  trimestrial: "Trimestrial",
  anual: "Anual",
  "one-time": "Unică",
};

export function ObligationFormDialog({
  obligation,
  children,
}: {
  obligation?: Obligation;
  children: React.ReactNode;
}) {
  const [recurenta, setRecurenta] = useState<string>(obligation?.recurenta ?? "lunar");

  const { saveObligation } = useData();
  return (
    <FormDialog
      title={obligation ? "Editează obligație" : "Obligație nouă"}
      action={saveObligation}
      body={
        <>
          {obligation && <input type="hidden" name="id" value={obligation.id} />}
          <div className="space-y-1.5">
            <Label htmlFor="ob-descriere">Descriere</Label>
            <Input
              id="ob-descriere"
              name="descriere"
              defaultValue={obligation?.descriere}
              placeholder="ex: Chirie atelier"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ob-suma">Sumă (€)</Label>
              <Input
                id="ob-suma"
                name="suma"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={obligation?.suma}
                placeholder="0,00"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ob-scadenta">
                {recurenta === "one-time" ? "Scadență" : "Prima scadență (ancoră)"}
              </Label>
              <Input
                id="ob-scadenta"
                name="scadenta"
                type="date"
                defaultValue={obligation?.scadenta}
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Recurență</Label>
            <Select
              name="recurenta"
              value={recurenta}
              onValueChange={(v) => setRecurenta(v ?? "lunar")}
              items={RECURENTA_ITEMS}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selectează..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RECURENTA_ITEMS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {recurenta !== "one-time" && (
              <p className="text-xs text-muted-foreground">
                Se repetă pornind de la prima scadență (ex: lunar pe ziua 5).
              </p>
            )}
          </div>
          {recurenta === "one-time" && (
            <div className="space-y-1.5">
              <Label>Achitată</Label>
              <RadioGroup
                name="achitat"
                defaultValue={obligation?.achitat ? "da" : "nu"}
                className="flex gap-4 pt-1"
              >
                <Label htmlFor="ob-a-nu" className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="nu" id="ob-a-nu" /> Nu — apare în calendar
                </Label>
                <Label htmlFor="ob-a-da" className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="da" id="ob-a-da" /> Da — achitată
                </Label>
              </RadioGroup>
            </div>
          )}
        </>
      }
    >
      {children}
    </FormDialog>
  );
}
