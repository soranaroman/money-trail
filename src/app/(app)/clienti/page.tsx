"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useData } from "@/lib/data-context";
import { incasatByProject as incasatByProjectFn } from "@/lib/derive";
import { ClientFormDialog } from "@/components/crud/client-form-dialog";
import { ClientsTable, type ClientWithStats } from "./clients-table";

export default function ClientiPage() {
  const { clients, projects, incomes } = useData();
  const incasatByProject = incasatByProjectFn(incomes);

  const cuStats: ClientWithStats[] = clients.map((c) => {
    const proiecteClient = projects.filter((p) => p.client_id === c.id);
    const totalOferte = proiecteClient.reduce((s, p) => s + Number(p.oferta_total), 0);
    const totalIncasat = proiecteClient.reduce(
      (s, p) => s + (incasatByProject.get(p.id) ?? 0),
      0
    );
    return {
      ...c,
      nrProiecte: proiecteClient.length,
      totalOferte,
      totalIncasat,
      restDePlata: totalOferte - totalIncasat,
    };
  });

  const nrGc = clients.filter((c) => c.tip === "general_contractor").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clienți</h1>
          <p className="text-sm text-muted-foreground">
            {clients.length} {clients.length === 1 ? "client" : "clienți"}
            {nrGc > 0 && ` · ${nrGc} general contractor`}
          </p>
        </div>
        <ClientFormDialog>
          <Button>
            <Plus className="mr-2 size-4" />
            Adaugă client
          </Button>
        </ClientFormDialog>
      </div>

      <ClientsTable clients={cuStats} />
    </div>
  );
}
