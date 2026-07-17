"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormDialog } from "@/components/crud/form-dialog";
import { useData } from "@/lib/data-context";
import type { Employee } from "@/lib/types";

export function EmployeeFormDialog({
  employee,
  children,
}: {
  employee?: Employee;
  children: React.ReactNode;
}) {
  const { saveEmployee } = useData();
  return (
    <FormDialog
      title={employee ? "Editează angajat" : "Angajat nou"}
      action={saveEmployee}
      body={
        <>
          {employee && <input type="hidden" name="id" value={employee.id} />}
          <div className="space-y-1.5">
            <Label htmlFor="emp-nume">Nume</Label>
            <Input
              id="emp-nume"
              name="nume"
              defaultValue={employee?.nume}
              placeholder="ex: Ion Popescu"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="emp-rata">Rată/zi (€)</Label>
            <Input
              id="emp-rata"
              name="rata_zi"
              type="number"
              step="0.01"
              min="0"
              defaultValue={employee?.rata_zi}
              placeholder="0,00"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <RadioGroup
              name="activ"
              defaultValue={employee ? (employee.activ ? "activ" : "inactiv") : "activ"}
              className="flex gap-4 pt-1"
            >
              <Label htmlFor="emp-activ" className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="activ" id="emp-activ" /> Activ
              </Label>
              <Label htmlFor="emp-inactiv" className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value="inactiv" id="emp-inactiv" /> Inactiv
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
