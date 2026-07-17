"use client";

import { useData } from "@/lib/data-context";
import {
  RapoarteClient,
  type RaportAlloc,
  type RaportNeatasata,
  type RaportProject,
} from "./rapoarte-client";

export default function RapoartePage() {
  const { projects, clients, expenses, workdays, employees } = useData();

  const clientNume = new Map(clients.map((c) => [c.id, c.nume]));
  const projectRows: RaportProject[] = projects.map((p) => ({
    id: p.id,
    nume: p.nume,
    locatie: p.locatie,
    clientNume: clientNume.get(p.client_id) ?? "—",
    oferta_total: Number(p.oferta_total),
    data_start: p.data_start,
  }));

  // alocari cu atributele cheltuielii-parinte
  const allocs: RaportAlloc[] = expenses.flatMap((e) =>
    e.alocari.map((a) => ({
      project_id: a.project_id,
      suma: a.suma,
      grupa: e.grupa,
      categorie: e.categorie,
      declarat: e.declarat,
    }))
  );

  // cheltuieli fara nicio alocare
  const neatasate: RaportNeatasata[] = expenses
    .filter((e) => e.alocari.length === 0)
    .map((e) => ({
      id: e.id,
      descriere: e.descriere,
      grupa: e.grupa,
      categorie: e.categorie,
      suma: Number(e.suma_total),
      declarat: e.declarat,
    }));

  // manopera per proiect
  const rata = new Map(employees.map((e) => [e.id, e.rata_zi]));
  const manoperaPerProject: Record<string, number> = {};
  for (const w of workdays) {
    manoperaPerProject[w.project_id] =
      (manoperaPerProject[w.project_id] ?? 0) + w.zile * (rata.get(w.employee_id) ?? 0);
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <RapoarteClient
      projects={projectRows}
      allocs={allocs}
      neatasate={neatasate}
      manoperaPerProject={manoperaPerProject}
      today={today}
    />
  );
}
