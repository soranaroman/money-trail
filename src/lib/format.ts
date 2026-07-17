import type { ExpenseCategorie, ExpenseGrupa, ProjectStatus } from "@/lib/types";

export function formatEur(n: number): string {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatEurDetailed(n: number): string {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatDate(s: string): string {
  return new Date(s).toLocaleDateString("ro-RO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function statusLabel(status: ProjectStatus): string {
  return {
    oferta: "Ofertă",
    in_lucru: "În lucru",
    finalizat: "Finalizat",
    garantie: "Garanție",
  }[status];
}

export function statusColor(status: ProjectStatus): string {
  return {
    oferta: "bg-gray-100 text-gray-700",
    in_lucru: "bg-blue-100 text-blue-700",
    finalizat: "bg-green-100 text-green-700",
    garantie: "bg-amber-100 text-amber-700",
  }[status];
}

export function incomeTipLabel(tip: "avans" | "transa" | "final"): string {
  return { avans: "Avans", transa: "Tranșă", final: "Plată finală" }[tip];
}

export function grupaLabel(g: ExpenseGrupa): string {
  return {
    materiale: "Materiale",
    deplasare: "Deplasare",
    generala: "Generală firmă",
    obligatie: "Obligație",
  }[g];
}

export function grupaColor(g: ExpenseGrupa): string {
  return {
    materiale: "bg-blue-100 text-blue-700",
    deplasare: "bg-purple-100 text-purple-700",
    generala: "bg-amber-100 text-amber-700",
    obligatie: "bg-rose-100 text-rose-700",
  }[g];
}

export function categorieLabel(c: ExpenseCategorie): string {
  return {
    principal: "Material principal",
    auxiliar: "Material auxiliar",
    neprevazut: "Neprevăzut",
    pierdere: "Pierdere irecuperabilă",
    cazare: "Cazare",
    combustibil: "Combustibil",
    dieta: "Dietă / mâncare",
    telefon: "Telefon",
    abonament: "Abonament",
    contabilitate: "Contabilitate",
    transport: "Transport",
    altele: "Altele",
  }[c];
}

/** Categoriile valide pentru fiecare grupa (aceeasi ordine ca in wireframe). */
export const CATEGORII_PER_GRUPA: Record<ExpenseGrupa, ExpenseCategorie[]> = {
  materiale: ["principal", "auxiliar", "neprevazut", "pierdere"],
  deplasare: ["cazare", "combustibil", "dieta"],
  generala: ["telefon", "abonament", "contabilitate", "transport", "altele"],
  obligatie: ["altele"],
};
