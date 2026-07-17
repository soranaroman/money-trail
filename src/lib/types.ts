// Tipurile randurilor din baza de date (supabase/migrations/0001_init_schema.sql).
// Coloanele optionale vin din Postgres ca null, nu undefined.

export type ClientTip = "direct" | "general_contractor";

export type Client = {
  id: string;
  nume: string;
  tip: ClientTip;
  email: string | null;
  created_at: string;
};

export type ProjectStatus = "oferta" | "in_lucru" | "finalizat" | "garantie";

export type Project = {
  id: string;
  client_id: string;
  nume: string;
  locatie: string;
  client_final: string | null;
  status: ProjectStatus;
  oferta_total: number;
  data_start: string;
  data_estimata_incasare: string | null;
  created_at: string;
};

export type ExpenseGrupa = "materiale" | "deplasare" | "generala" | "obligatie";
export type ExpenseCategorie =
  | "principal"
  | "auxiliar"
  | "neprevazut"
  | "pierdere"
  | "cazare"
  | "combustibil"
  | "dieta"
  | "telefon"
  | "abonament"
  | "contabilitate"
  | "transport"
  | "altele";

export type Expense = {
  id: string;
  data: string;
  suma_total: number;
  grupa: ExpenseGrupa;
  categorie: ExpenseCategorie;
  descriere: string;
  furnizor: string | null;
  locatie: string | null;
  declarat: boolean;
  created_at: string;
};

export type Allocation = {
  project_id: string;
  suma: number;
};

/** Cheltuiala cu alocarile ei (gol = neasociata; 1 = un proiect; n = split). */
export type ExpenseWithAlocari = Expense & { alocari: Allocation[] };

export type Employee = {
  id: string;
  nume: string;
  rata_zi: number;
  activ: boolean;
};

export type Workday = {
  id: string;
  employee_id: string;
  project_id: string;
  week_start: string; // luni
  zile: number; // increment 0.5
};

export type ObligationRecurence = "lunar" | "trimestrial" | "anual" | "one-time";

export type Obligation = {
  id: string;
  descriere: string;
  suma: number;
  /** pentru one-time: data exacta; pentru recurente: prima scadenta (ancora) */
  scadenta: string;
  recurenta: ObligationRecurence;
  achitat: boolean;
};

export type Settings = {
  id: number;
  sold_curent: number;
  sold_updated_at: string;
  marja_neprevazut_setata: number;
  marja_pierderi_setata: number;
};

export type IncomeTip = "avans" | "transa" | "final";
export type ModPlata = "TB" | "Cash";

export type Income = {
  id: string;
  project_id: string;
  data: string;
  suma: number;
  tip: IncomeTip;
  declarat: boolean;
  mod_plata: ModPlata;
  created_at: string;
};
