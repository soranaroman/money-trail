"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormDialog } from "@/components/crud/form-dialog";
import { useData } from "@/lib/data-context";
import type { Client } from "@/lib/types";

export function ClientFormDialog({
  client,
  children,
}: {
  client?: Client;
  children: React.ReactNode;
}) {
  const { saveClient } = useData();
  return (
    <FormDialog
      title={client ? "Editează client" : "Client nou"}
      action={saveClient}
      body={
        <>
          {client && <input type="hidden" name="id" value={client.id} />}
          <div className="space-y-1.5">
            <Label htmlFor="cl-nume">Nume</Label>
            <Input
              id="cl-nume"
              name="nume"
              defaultValue={client?.nume}
              placeholder="ex: Construct SRL"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cl-email">Email (opțional)</Label>
            <Input
              id="cl-email"
              name="email"
              type="email"
              defaultValue={client?.email ?? ""}
              placeholder="ex: office@firma.ro"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tip</Label>
            <RadioGroup name="tip" defaultValue={client?.tip ?? "direct"} className="flex gap-4 pt-1">
              <Label htmlFor="cl-direct" className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="direct" id="cl-direct" /> Direct
              </Label>
              <Label htmlFor="cl-gc" className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="general_contractor" id="cl-gc" /> General contractor
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
