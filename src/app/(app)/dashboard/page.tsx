"use client";

import { useData } from "@/lib/data-context";
import { expandObligations } from "@/lib/obligations";
import {
  DashboardClient,
  type DashExpense,
  type DashIncome,
  type DashManopera,
} from "./dashboard-client";

export default function DashboardPage() {
  const {
    expenses,
    projects,
    obligations,
    settings,
    workdays,
    employees,
    incomes: allIncomes,
  } = useData();

  const incomes: DashIncome[] = allIncomes.map((i) => ({
    suma: i.suma,
    declarat: i.declarat,
    data: i.data,
  }));

  const expenseRows: DashExpense[] = expenses.map((e) => ({
    suma: Number(e.suma_total),
    declarat: e.declarat,
    grupa: e.grupa,
    categorie: e.categorie,
    data: e.data,
  }));

  // cost manopera agregat pe luna (dupa saptamana de start)
  const rata = new Map(employees.map((e) => [e.id, e.rata_zi]));
  const perLuna = new Map<string, number>();
  for (const w of workdays) {
    const key = w.week_start.slice(0, 7);
    perLuna.set(key, (perLuna.get(key) ?? 0) + w.zile * (rata.get(w.employee_id) ?? 0));
  }
  const manopera: DashManopera[] = [...perLuna.entries()].map(([month, cost]) => ({
    month,
    cost,
  }));

  const oferteTotal = projects.reduce((s, p) => s + Number(p.oferta_total), 0);

  const today = new Date().toISOString().slice(0, 10);
  const events60 = expandObligations(obligations, today, 60).map((ev) => ({
    descriere: ev.descriere,
    suma: ev.suma,
    data: ev.data,
  }));

  return (
    <DashboardClient
      incomes={incomes}
      expenses={expenseRows}
      manopera={manopera}
      oferteTotal={oferteTotal}
      events60={events60}
      soldCurent={settings.sold_curent}
      soldUpdatedAt={settings.sold_updated_at}
      marjaNeprevSetata={settings.marja_neprevazut_setata}
      marjaPierderiSetata={settings.marja_pierderi_setata}
      today={today}
    />
  );
}
