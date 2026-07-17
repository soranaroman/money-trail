// Helperi de perioade calendaristice (siguri si pe client, si pe server).

export function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

/** [start, end] (inclusiv) pentru trimestrul care contine data */
export function quarterRange(iso: string): { start: string; end: string; label: string } {
  const y = Number(iso.slice(0, 4));
  const q = Math.floor((Number(iso.slice(5, 7)) - 1) / 3); // 0..3
  const start = `${y}-${String(q * 3 + 1).padStart(2, "0")}-01`;
  const endMonth = q * 3 + 3;
  const lastDay = new Date(Date.UTC(y, endMonth, 0)).getUTCDate();
  const end = `${y}-${String(endMonth).padStart(2, "0")}-${lastDay}`;
  return { start, end, label: `Q${q + 1} ${y}` };
}

export function prevQuarterRange(iso: string): { start: string; end: string; label: string } {
  const y = Number(iso.slice(0, 4));
  const m = Number(iso.slice(5, 7));
  const prevMonth = m - 3;
  const anchor =
    prevMonth >= 1
      ? `${y}-${String(prevMonth).padStart(2, "0")}-01`
      : `${y - 1}-${String(prevMonth + 12).padStart(2, "0")}-01`;
  return quarterRange(anchor);
}

/** [start, end] (inclusiv) pentru luna care contine data */
export function monthRange(iso: string): { start: string; end: string; label: string } {
  const y = Number(iso.slice(0, 4));
  const m = Number(iso.slice(5, 7));
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return {
    start: `${iso.slice(0, 7)}-01`,
    end: `${iso.slice(0, 7)}-${lastDay}`,
    label: "Luna asta",
  };
}

/** ultimele n luni (chei yyyy-mm), terminand cu luna datei date */
export function lastMonths(iso: string, n: number): string[] {
  const y = Number(iso.slice(0, 4));
  const m = Number(iso.slice(5, 7));
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const total = y * 12 + (m - 1) - i;
    keys.push(`${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`);
  }
  return keys;
}
