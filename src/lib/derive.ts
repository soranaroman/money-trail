// Agregate pure peste datele din context (echivalentul interogărilor server de dinainte).

import type { Employee, ExpenseWithAlocari, Income, Workday } from "@/lib/types";

/** Suma încasată per proiect (incasat nu se stochează — se derivă din incomes). */
export function incasatByProject(incomes: Income[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const i of incomes) {
    map.set(i.project_id, (map.get(i.project_id) ?? 0) + Number(i.suma));
  }
  return map;
}

/** Cost real per proiect = cheltuieli alocate + manoperă (zile × rată). */
export function costByProject(
  expenses: ExpenseWithAlocari[],
  workdays: Workday[],
  employees: Employee[]
): Map<string, number> {
  const rata = new Map(employees.map((e) => [e.id, e.rata_zi]));
  const map = new Map<string, number>();
  for (const e of expenses) {
    for (const a of e.alocari) {
      map.set(a.project_id, (map.get(a.project_id) ?? 0) + a.suma);
    }
  }
  for (const w of workdays) {
    map.set(w.project_id, (map.get(w.project_id) ?? 0) + w.zile * (rata.get(w.employee_id) ?? 0));
  }
  return map;
}

/** Cheltuielile alocate unui proiect, cu suma alocată acestuia. */
export function expensesForProject(
  expenses: ExpenseWithAlocari[],
  projectId: string
): { expense: ExpenseWithAlocari; suma: number }[] {
  return expenses
    .filter((e) => e.alocari.some((a) => a.project_id === projectId))
    .map((e) => ({
      expense: e,
      suma: e.alocari.filter((a) => a.project_id === projectId).reduce((s, a) => s + a.suma, 0),
    }));
}
