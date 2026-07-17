"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDialog } from "@/components/crud/form-dialog";
import { useData } from "@/lib/data-context";

export function UpdateSoldDialog({
  soldCurent,
  today,
  children,
}: {
  soldCurent: number;
  /** yyyy-mm-dd — calculat pe server ca sa nu difere de randarea SSR */
  today: string;
  children: React.ReactNode;
}) {
  const { updateSold } = useData();
  return (
    <FormDialog
      title="Actualizează sold"
      description="Introdu soldul curent din bancă."
      action={updateSold}
      body={
        <>
          <div className="space-y-1.5">
            <Label htmlFor="sold-suma">Sold curent (€)</Label>
            <Input
              id="sold-suma"
              name="sold_curent"
              type="number"
              step="0.01"
              defaultValue={soldCurent}
              placeholder="0,00"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sold-data">Data actualizării</Label>
            <Input
              id="sold-data"
              name="sold_updated_at"
              type="date"
              defaultValue={today}
              required
            />
          </div>
        </>
      }
    >
      {children}
    </FormDialog>
  );
}
