import type { Obligation } from "@/lib/types";

export type ObligationEvent = {
  obligationId: string;
  descriere: string;
  suma: number;
  data: string; // yyyy-mm-dd
};

function toUTC(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00Z");
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Adauga k luni fata de data de baza pastrand ziua ancorei; daca luna tinta
 * e mai scurta, se foloseste ultima ei zi. Se calculeaza mereu de la baza
 * (nu incremental) ca sa nu "alunece" ziua dupa o luna scurta
 * (ex: 31 ian → 28 feb → 31 mar, nu 28 mar).
 */
function addMonths(base: Date, k: number): Date {
  const day = base.getUTCDate();
  const res = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + k, 1));
  const lastDay = new Date(Date.UTC(res.getUTCFullYear(), res.getUTCMonth() + 1, 0)).getUTCDate();
  res.setUTCDate(Math.min(day, lastDay));
  return res;
}

/**
 * Expandeaza obligatiile in evenimente de plata in fereastra [from, from+days].
 * one-time: o singura aparitie (sarita daca e achitata); lunar/trimestrial/anual:
 * aparitii periodice pornind de la scadenta-ancora.
 */
export function expandObligations(
  obligations: Obligation[],
  fromISO: string,
  days: number
): ObligationEvent[] {
  const from = toUTC(fromISO);
  const to = new Date(from);
  to.setUTCDate(to.getUTCDate() + days);

  const events: ObligationEvent[] = [];
  for (const o of obligations) {
    const base = toUTC(o.scadenta);

    if (o.recurenta === "one-time") {
      if (!o.achitat && base >= from && base <= to) {
        events.push({ obligationId: o.id, descriere: o.descriere, suma: o.suma, data: iso(base) });
      }
      continue;
    }

    const step = o.recurenta === "lunar" ? 1 : o.recurenta === "trimestrial" ? 3 : 12;
    let k = 0;
    let occ = base;
    while (occ < from) {
      k += 1;
      occ = addMonths(base, k * step);
    }
    while (occ <= to) {
      events.push({ obligationId: o.id, descriere: o.descriere, suma: o.suma, data: iso(occ) });
      k += 1;
      occ = addMonths(base, k * step);
    }
  }

  events.sort((a, b) => a.data.localeCompare(b.data));
  return events;
}
