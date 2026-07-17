"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormDialog } from "@/components/crud/form-dialog";
import { useData } from "@/lib/data-context";
import type { Client, Project } from "@/lib/types";

export function ProjectFormDialog({
  project,
  clone = false,
  clients,
  children,
}: {
  project?: Project;
  /** true = foloseste `project` doar ca prefill si salveaza ca proiect NOU */
  clone?: boolean;
  clients: Pick<Client, "id" | "nume">[];
  children: React.ReactNode;
}) {
  const isEdit = !!project && !clone;
  const { saveProject } = useData();
  return (
    <FormDialog
      title={isEdit ? "Editează proiect" : "Proiect nou"}
      action={saveProject}
      body={
        <>
          {isEdit && project && <input type="hidden" name="id" value={project.id} />}
          <div className="space-y-1.5">
            <Label htmlFor="pr-nume">Nume proiect</Label>
            <Input
              id="pr-nume"
              name="nume"
              defaultValue={project?.nume}
              placeholder="ex: Fațadă vilă"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Client</Label>
              <Select
                name="client_id"
                defaultValue={project?.client_id}
                items={clients.map((c) => ({ value: c.id, label: c.nume }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selectează client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nume}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                name="status"
                defaultValue={project?.status ?? "oferta"}
                items={{
                  oferta: "Ofertă",
                  in_lucru: "În lucru",
                  finalizat: "Finalizat",
                  garantie: "Garanție",
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selectează..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oferta">Ofertă</SelectItem>
                  <SelectItem value="in_lucru">În lucru</SelectItem>
                  <SelectItem value="finalizat">Finalizat</SelectItem>
                  <SelectItem value="garantie">Garanție</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pr-locatie">Locație</Label>
              <Input
                id="pr-locatie"
                name="locatie"
                defaultValue={project?.locatie}
                placeholder="ex: Bilbao"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pr-client-final">Client final (opțional)</Label>
              <Input
                id="pr-client-final"
                name="client_final"
                defaultValue={project?.client_final ?? ""}
                placeholder="pt. general contractor"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pr-oferta">Ofertă totală (€)</Label>
            <Input
              id="pr-oferta"
              name="oferta_total"
              type="number"
              step="0.01"
              min="0"
              defaultValue={project?.oferta_total}
              placeholder="0,00"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pr-start">Data start</Label>
              <Input
                id="pr-start"
                name="data_start"
                type="date"
                defaultValue={clone ? new Date().toISOString().slice(0, 10) : project?.data_start}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pr-est">Estimare încasare (opțional)</Label>
              <Input
                id="pr-est"
                name="data_estimata_incasare"
                type="date"
                defaultValue={clone ? "" : (project?.data_estimata_incasare ?? "")}
              />
            </div>
          </div>
        </>
      }
    >
      {children}
    </FormDialog>
  );
}
