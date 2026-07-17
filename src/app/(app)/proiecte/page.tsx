"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useData } from "@/lib/data-context";
import { costByProject as costByProjectFn } from "@/lib/derive";
import { ProjectFormDialog } from "@/components/crud/project-form-dialog";
import { ProjectsTable, type ProjectRow } from "./projects-table";

export default function ProiectePage() {
  const { projects, clients, expenses, workdays, employees } = useData();
  const costByProject = costByProjectFn(expenses, workdays, employees);

  const clientNume = new Map(clients.map((c) => [c.id, c.nume]));

  const rows: ProjectRow[] = projects.map((p) => {
    const oferta = Number(p.oferta_total);
    const cheltuieli = costByProject.get(p.id) ?? 0;
    const profit = oferta - cheltuieli;
    const marja = oferta > 0 ? (profit / oferta) * 100 : 0;
    return {
      ...p,
      clientNume: clientNume.get(p.client_id) ?? "—",
      cheltuieli,
      profit,
      marja,
    };
  });

  const inLucru = projects.filter((p) => p.status === "in_lucru").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proiecte</h1>
          <p className="text-sm text-muted-foreground">
            {projects.length} {projects.length === 1 ? "proiect" : "proiecte"} · {inLucru} în lucru
          </p>
        </div>
        <ProjectFormDialog clients={clients}>
          <Button>
            <Plus className="mr-2 size-4" />
            Adaugă proiect
          </Button>
        </ProjectFormDialog>
      </div>

      <ProjectsTable projects={rows} clients={clients} />
    </div>
  );
}
