"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { freshSeed, type DataState } from "@/lib/seed";
import { str, strOrNull, num, type ActionResult } from "@/lib/actions/helpers";
import { CATEGORII_PER_GRUPA } from "@/lib/format";
import type { Allocation, ExpenseCategorie, ExpenseGrupa } from "@/lib/types";

const LS_KEY = "moneytrail:data:v2";
const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

function ok(): ActionResult {
  return undefined;
}

type Ctx = DataState & {
  ready: boolean;
  reset: () => void;
  // clients
  saveClient: (fd: FormData) => Promise<ActionResult>;
  deleteClient: (id: string) => Promise<ActionResult>;
  // projects
  saveProject: (fd: FormData) => Promise<ActionResult>;
  deleteProject: (id: string) => Promise<ActionResult>;
  // expenses
  saveExpense: (fd: FormData) => Promise<ActionResult>;
  deleteExpense: (id: string) => Promise<ActionResult>;
  // incomes
  saveIncome: (fd: FormData) => Promise<ActionResult>;
  deleteIncome: (id: string) => Promise<ActionResult>;
  // employees
  saveEmployee: (fd: FormData) => Promise<ActionResult>;
  deleteEmployee: (id: string) => Promise<ActionResult>;
  // workdays
  saveWeek: (fd: FormData) => Promise<ActionResult>;
  deleteWeek: (weekStart: string) => Promise<ActionResult>;
  // obligations
  saveObligation: (fd: FormData) => Promise<ActionResult>;
  deleteObligation: (id: string) => Promise<ActionResult>;
  // settings
  updateSold: (fd: FormData) => Promise<ActionResult>;
  updateMarje: (fd: FormData) => Promise<ActionResult>;
  updatePassword: (fd: FormData) => Promise<ActionResult>;
};

const DataContext = createContext<Ctx | null>(null);

export function useData(): Ctx {
  const c = useContext(DataContext);
  if (!c) throw new Error("useData trebuie folosit în interiorul <DataProvider>");
  return c;
}

function parseAlocari(raw: string): Allocation[] | null {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const alocari: Allocation[] = [];
    for (const a of parsed) {
      const project_id = String(a?.project_id ?? "").trim();
      const suma = Number(String(a?.suma ?? "").replace(",", "."));
      if (!project_id) return null;
      if (Number.isNaN(suma) || suma <= 0) return null;
      alocari.push({ project_id, suma });
    }
    return alocari;
  } catch {
    return null;
  }
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DataState | null>(null);

  // incarca din localStorage (sau seed proaspat) dupa montare — evita mismatch SSR
  useEffect(() => {
    let initial: DataState;
    try {
      const raw = localStorage.getItem(LS_KEY);
      initial = raw ? (JSON.parse(raw) as DataState) : freshSeed();
    } catch {
      initial = freshSeed();
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratare unică din localStorage la montare
    setData(initial);
  }, []);

  // persista la fiecare schimbare
  useEffect(() => {
    if (data) {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(data));
      } catch {
        /* quota / private mode — demo funcționează oricum în memorie */
      }
    }
  }, [data]);

  function apply(mut: (d: DataState) => DataState): void {
    setData((prev) => (prev ? mut(prev) : prev));
  }

  if (!data) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Se încarcă demo…
      </div>
    );
  }

  const value: Ctx = {
    ...data,
    ready: true,

    reset() {
      try {
        localStorage.removeItem(LS_KEY);
      } catch {}
      setData(freshSeed());
    },

    // ---------------- CLIENTS ----------------
    async saveClient(fd) {
      const id = strOrNull(fd, "id");
      const nume = str(fd, "nume");
      const tip = str(fd, "tip");
      const email = strOrNull(fd, "email");
      if (!nume) return { error: "Numele este obligatoriu." };
      if (tip !== "direct" && tip !== "general_contractor")
        return { error: "Tip de client invalid." };
      apply((d) => {
        if (id) {
          return {
            ...d,
            clients: d.clients.map((c) =>
              c.id === id ? { ...c, nume, tip, email } : c
            ),
          };
        }
        return {
          ...d,
          clients: [
            ...d.clients,
            { id: uid(), nume, tip, email, created_at: new Date().toISOString() },
          ],
        };
      });
      return ok();
    },
    async deleteClient(id) {
      const d = data;
      if (d.projects.some((p) => p.client_id === id))
        return {
          error: "Clientul are proiecte asociate — șterge sau mută proiectele mai întâi.",
        };
      apply((d) => ({ ...d, clients: d.clients.filter((c) => c.id !== id) }));
      return ok();
    },

    // ---------------- PROJECTS ----------------
    async saveProject(fd) {
      const id = strOrNull(fd, "id");
      const nume = str(fd, "nume");
      const client_id = str(fd, "client_id");
      const locatie = str(fd, "locatie");
      const client_final = strOrNull(fd, "client_final");
      const status = str(fd, "status");
      const oferta_total = num(fd, "oferta_total");
      const data_start = str(fd, "data_start");
      const data_estimata_incasare = strOrNull(fd, "data_estimata_incasare");
      if (!nume) return { error: "Numele proiectului este obligatoriu." };
      if (!client_id) return { error: "Selectează clientul." };
      if (!["oferta", "in_lucru", "finalizat", "garantie"].includes(status))
        return { error: "Status invalid." };
      if (Number.isNaN(oferta_total) || oferta_total < 0)
        return { error: "Oferta totală trebuie să fie un număr pozitiv." };
      if (!data_start) return { error: "Data de start este obligatorie." };
      const patch = {
        nume,
        client_id,
        locatie,
        client_final,
        status: status as "oferta" | "in_lucru" | "finalizat" | "garantie",
        oferta_total,
        data_start,
        data_estimata_incasare,
      };
      apply((d) => {
        if (id)
          return {
            ...d,
            projects: d.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
          };
        return {
          ...d,
          projects: [
            ...d.projects,
            { id: uid(), ...patch, created_at: new Date().toISOString() },
          ],
        };
      });
      return ok();
    },
    async deleteProject(id) {
      const d = data;
      const hasCost =
        d.expenses.some((e) => e.alocari.some((a) => a.project_id === id)) ||
        d.workdays.some((w) => w.project_id === id);
      if (hasCost)
        return {
          error: "Proiectul are cheltuieli sau manoperă asociate — nu poate fi șters.",
        };
      apply((d) => ({
        ...d,
        projects: d.projects.filter((p) => p.id !== id),
        incomes: d.incomes.filter((i) => i.project_id !== id), // cascade
      }));
      return ok();
    },

    // ---------------- EXPENSES ----------------
    async saveExpense(fd) {
      const id = strOrNull(fd, "id");
      const data = str(fd, "data");
      const suma_total = num(fd, "suma_total");
      const grupa = str(fd, "grupa") as ExpenseGrupa;
      const categorie = str(fd, "categorie") as ExpenseCategorie;
      const descriere = str(fd, "descriere");
      const furnizor = strOrNull(fd, "furnizor");
      const locatie = strOrNull(fd, "locatie");
      const declarat = str(fd, "declarat") === "da";
      const alocari = parseAlocari(str(fd, "alocari") || "[]");
      if (!data) return { error: "Data este obligatorie." };
      if (Number.isNaN(suma_total) || suma_total <= 0)
        return { error: "Suma totală trebuie să fie mai mare ca 0." };
      if (!(grupa in CATEGORII_PER_GRUPA)) return { error: "Grupă invalidă." };
      if (!CATEGORII_PER_GRUPA[grupa].includes(categorie))
        return { error: "Alege o categorie validă pentru grupa selectată." };
      if (!descriere) return { error: "Descrierea este obligatorie." };
      if (alocari === null)
        return { error: "Completează proiectul și suma pentru fiecare alocare." };
      if (new Set(alocari.map((a) => a.project_id)).size < alocari.length)
        return { error: "Același proiect apare de două ori în alocări." };
      if (alocari.length > 0) {
        const totalAlocat = alocari.reduce((s, a) => s + a.suma, 0);
        if (Math.abs(totalAlocat - suma_total) > 0.01)
          return {
            error: `Alocările (${totalAlocat.toFixed(2)} €) trebuie să acopere exact suma totală (${suma_total.toFixed(2)} €).`,
          };
      }
      const patch = { data, suma_total, grupa, categorie, descriere, furnizor, locatie, declarat };
      apply((d) => {
        if (id)
          return {
            ...d,
            expenses: d.expenses.map((e) => (e.id === id ? { ...e, ...patch, alocari } : e)),
          };
        return {
          ...d,
          expenses: [
            { id: uid(), ...patch, alocari, created_at: new Date().toISOString() },
            ...d.expenses,
          ],
        };
      });
      return ok();
    },
    async deleteExpense(id) {
      apply((d) => ({ ...d, expenses: d.expenses.filter((e) => e.id !== id) }));
      return ok();
    },

    // ---------------- INCOMES ----------------
    async saveIncome(fd) {
      const id = strOrNull(fd, "id");
      const project_id = str(fd, "project_id");
      const data = str(fd, "data");
      const suma = num(fd, "suma");
      const tip = str(fd, "tip");
      const mod_plata = str(fd, "mod_plata");
      const declarat = str(fd, "declarat") === "da";
      if (!project_id) return { error: "Selectează proiectul." };
      if (!data) return { error: "Data este obligatorie." };
      if (Number.isNaN(suma) || suma <= 0) return { error: "Suma trebuie să fie mai mare ca 0." };
      if (!["avans", "transa", "final"].includes(tip))
        return { error: "Tip de încasare invalid." };
      if (mod_plata !== "TB" && mod_plata !== "Cash") return { error: "Mod de plată invalid." };
      const patch = {
        project_id,
        data,
        suma,
        tip: tip as "avans" | "transa" | "final",
        mod_plata: mod_plata as "TB" | "Cash",
        declarat,
      };
      apply((d) => {
        if (id)
          return {
            ...d,
            incomes: d.incomes.map((i) => (i.id === id ? { ...i, ...patch } : i)),
          };
        return {
          ...d,
          incomes: [
            ...d.incomes,
            { id: uid(), ...patch, created_at: new Date().toISOString() },
          ],
        };
      });
      return ok();
    },
    async deleteIncome(id) {
      apply((d) => ({ ...d, incomes: d.incomes.filter((i) => i.id !== id) }));
      return ok();
    },

    // ---------------- EMPLOYEES ----------------
    async saveEmployee(fd) {
      const id = strOrNull(fd, "id");
      const nume = str(fd, "nume");
      const rata_zi = num(fd, "rata_zi");
      const activ = str(fd, "activ") !== "inactiv";
      if (!nume) return { error: "Numele este obligatoriu." };
      if (Number.isNaN(rata_zi) || rata_zi < 0)
        return { error: "Rata pe zi trebuie să fie un număr pozitiv." };
      const patch = { nume, rata_zi, activ };
      apply((d) => {
        if (id)
          return {
            ...d,
            employees: d.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          };
        return { ...d, employees: [...d.employees, { id: uid(), ...patch }] };
      });
      return ok();
    },
    async deleteEmployee(id) {
      const d = data;
      if (d.workdays.some((w) => w.employee_id === id))
        return {
          error:
            "Angajatul are zile lucrate înregistrate — marchează-l inactiv în loc să-l ștergi.",
        };
      apply((d) => ({ ...d, employees: d.employees.filter((e) => e.id !== id) }));
      return ok();
    },

    // ---------------- WORKDAYS (săptămână) ----------------
    async saveWeek(fd) {
      const week_start = str(fd, "week_start");
      if (!week_start) return { error: "Alege data de început a săptămânii." };
      const day = new Date(week_start + "T00:00:00Z").getUTCDay();
      if (day !== 1) return { error: "Data de început trebuie să fie o zi de luni." };
      let randuri: { employee_id: string; project_id: string; zile: number }[];
      try {
        const parsed = JSON.parse(str(fd, "randuri") || "[]");
        if (!Array.isArray(parsed)) throw new Error();
        randuri = parsed.map((r) => ({
          employee_id: String(r?.employee_id ?? "").trim(),
          project_id: String(r?.project_id ?? "").trim(),
          zile: Number(String(r?.zile ?? "").replace(",", ".")),
        }));
      } catch {
        return { error: "Rândurile trimise sunt invalide." };
      }
      for (const r of randuri) {
        if (!r.employee_id || !r.project_id)
          return { error: "Fiecare rând are nevoie de angajat și proiect." };
        if (Number.isNaN(r.zile) || r.zile <= 0 || (r.zile * 2) % 1 !== 0)
          return { error: "Zilele se completează în incremente de 0,5 (ex: 0,5 · 1 · 2,5)." };
      }
      if (new Set(randuri.map((r) => r.employee_id + "|" + r.project_id)).size < randuri.length)
        return { error: "Aceeași combinație angajat + proiect apare de două ori." };
      apply((d) => ({
        ...d,
        workdays: [
          ...d.workdays.filter((w) => w.week_start !== week_start),
          ...randuri.map((r) => ({ id: uid(), ...r, week_start })),
        ],
      }));
      return ok();
    },
    async deleteWeek(weekStart) {
      apply((d) => ({ ...d, workdays: d.workdays.filter((w) => w.week_start !== weekStart) }));
      return ok();
    },

    // ---------------- OBLIGATIONS ----------------
    async saveObligation(fd) {
      const id = strOrNull(fd, "id");
      const descriere = str(fd, "descriere");
      const suma = num(fd, "suma");
      const scadenta = str(fd, "scadenta");
      const recurenta = str(fd, "recurenta");
      const achitat = str(fd, "achitat") === "da";
      if (!descriere) return { error: "Descrierea este obligatorie." };
      if (Number.isNaN(suma) || suma <= 0) return { error: "Suma trebuie să fie mai mare ca 0." };
      if (!scadenta) return { error: "Scadența este obligatorie." };
      if (!["lunar", "trimestrial", "anual", "one-time"].includes(recurenta))
        return { error: "Recurență invalidă." };
      const patch = {
        descriere,
        suma,
        scadenta,
        recurenta: recurenta as "lunar" | "trimestrial" | "anual" | "one-time",
        achitat: recurenta === "one-time" ? achitat : false,
      };
      apply((d) => {
        if (id)
          return {
            ...d,
            obligations: d.obligations.map((o) => (o.id === id ? { ...o, ...patch } : o)),
          };
        return { ...d, obligations: [...d.obligations, { id: uid(), ...patch }] };
      });
      return ok();
    },
    async deleteObligation(id) {
      apply((d) => ({ ...d, obligations: d.obligations.filter((o) => o.id !== id) }));
      return ok();
    },

    // ---------------- SETTINGS ----------------
    async updateSold(fd) {
      const sold_curent = num(fd, "sold_curent");
      const sold_updated_at = str(fd, "sold_updated_at");
      if (Number.isNaN(sold_curent)) return { error: "Introdu soldul curent." };
      if (!sold_updated_at) return { error: "Data actualizării este obligatorie." };
      apply((d) => ({ ...d, settings: { ...d.settings, sold_curent, sold_updated_at } }));
      return ok();
    },
    async updateMarje(fd) {
      const marja_neprevazut_setata = num(fd, "marja_neprevazut_setata");
      const marja_pierderi_setata = num(fd, "marja_pierderi_setata");
      if (
        Number.isNaN(marja_neprevazut_setata) ||
        marja_neprevazut_setata < 0 ||
        marja_neprevazut_setata > 100
      )
        return { error: "Marja pentru neprevăzute trebuie să fie între 0 și 100%." };
      if (
        Number.isNaN(marja_pierderi_setata) ||
        marja_pierderi_setata < 0 ||
        marja_pierderi_setata > 100
      )
        return { error: "Marja pentru pierderi trebuie să fie între 0 și 100%." };
      apply((d) => ({
        ...d,
        settings: { ...d.settings, marja_neprevazut_setata, marja_pierderi_setata },
      }));
      return ok();
    },
    async updatePassword(fd) {
      const password = String(fd.get("password") ?? "");
      if (password.length < 8) return { error: "Parola trebuie să aibă cel puțin 8 caractere." };
      return ok(); // demo — fără backend de autentificare
    },
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
