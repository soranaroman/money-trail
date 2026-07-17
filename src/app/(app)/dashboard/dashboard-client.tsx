"use client";

import { useState } from "react";
import { KpiCard } from "@/components/kpi-card";
import { DeclaratToggle, type DeclaratFilter } from "@/components/declarat-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEur, formatDate, grupaLabel } from "@/lib/format";
import { lastMonths, monthKey, prevQuarterRange, quarterRange } from "@/lib/periods";
import type { ExpenseGrupa } from "@/lib/types";

export type DashIncome = { suma: number; declarat: boolean; data: string };
export type DashExpense = {
  suma: number;
  declarat: boolean;
  grupa: ExpenseGrupa;
  categorie: string;
  data: string;
};
/** cost manopera pe luna (yyyy-mm) — nu are marcaj facturat/nefacturat */
export type DashManopera = { month: string; cost: number };
export type DashEvent = { descriere: string; suma: number; data: string };

const GRUPE: ExpenseGrupa[] = ["materiale", "deplasare", "generala", "obligatie"];

const MONTH_SHORT = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Noi", "Dec"];

export function DashboardClient({
  incomes,
  expenses,
  manopera,
  oferteTotal,
  events60,
  soldCurent,
  soldUpdatedAt,
  marjaNeprevSetata,
  marjaPierderiSetata,
  today,
}: {
  incomes: DashIncome[];
  expenses: DashExpense[];
  manopera: DashManopera[];
  oferteTotal: number;
  events60: DashEvent[];
  soldCurent: number;
  soldUpdatedAt: string;
  marjaNeprevSetata: number;
  marjaPierderiSetata: number;
  today: string;
}) {
  const [declarat, setDeclarat] = useState<DeclaratFilter>("tot");

  const matchDeclarat = (d: boolean) => declarat === "tot" || d === (declarat === "declarat");
  const filteredIncomes = incomes.filter((i) => matchDeclarat(i.declarat));
  const filteredExpenses = expenses.filter((e) => matchDeclarat(e.declarat));
  const includeManopera = declarat === "tot";

  // KPI trimestrul curent vs trimestrul anterior
  const qCur = quarterRange(today);
  const qPrev = prevQuarterRange(today);
  const inRange = (data: string, r: { start: string; end: string }) =>
    data >= r.start && data <= r.end;
  const manoperaInRange = (r: { start: string; end: string }) =>
    includeManopera
      ? manopera
          .filter((m) => m.month >= monthKey(r.start) && m.month <= monthKey(r.end))
          .reduce((s, m) => s + m.cost, 0)
      : 0;

  const venitCur = filteredIncomes.filter((i) => inRange(i.data, qCur)).reduce((s, i) => s + i.suma, 0);
  const venitPrev = filteredIncomes.filter((i) => inRange(i.data, qPrev)).reduce((s, i) => s + i.suma, 0);
  const cheltCur =
    filteredExpenses.filter((e) => inRange(e.data, qCur)).reduce((s, e) => s + e.suma, 0) +
    manoperaInRange(qCur);
  const cheltPrev =
    filteredExpenses.filter((e) => inRange(e.data, qPrev)).reduce((s, e) => s + e.suma, 0) +
    manoperaInRange(qPrev);

  const profitNet = venitCur - cheltCur;
  const marja = venitCur > 0 ? (profitNet / venitCur) * 100 : 0;

  const deltaVenit =
    venitPrev > 0 ? Math.round(((venitCur - venitPrev) / venitPrev) * 100) : null;
  const deltaChelt =
    cheltPrev > 0 ? Math.round(((cheltCur - cheltPrev) / cheltPrev) * 100) : null;

  // Structura cheltuieli pe grupe (toate datele, nu doar trimestrul)
  const totalManopera = manopera.reduce((s, m) => s + m.cost, 0);
  const cheltuieliPeGrupa: { key: string; label: string; suma: number }[] = [
    ...GRUPE.map((g) => ({
      key: g,
      label: grupaLabel(g),
      suma: filteredExpenses.filter((e) => e.grupa === g).reduce((s, e) => s + e.suma, 0),
    })),
    ...(includeManopera ? [{ key: "manopera", label: "Manoperă", suma: totalManopera }] : []),
  ];
  const maxGrupa = Math.max(...cheltuieliPeGrupa.map((c) => c.suma), 1);

  // Trend 6 luni
  const luni = lastMonths(today, 6);
  const trend = luni.map((key) => {
    const venit = filteredIncomes
      .filter((i) => monthKey(i.data) === key)
      .reduce((s, i) => s + i.suma, 0);
    const cheltuieli =
      filteredExpenses.filter((e) => monthKey(e.data) === key).reduce((s, e) => s + e.suma, 0) +
      (includeManopera
        ? manopera.filter((m) => m.month === key).reduce((s, m) => s + m.cost, 0)
        : 0);
    return { key, luna: MONTH_SHORT[Number(key.slice(5, 7)) - 1], venit, cheltuieli };
  });
  const maxTrend = Math.max(...trend.flatMap((t) => [t.venit, t.cheltuieli]), 1);

  // Calibrator marja (raportat la totalul ofertelor)
  const sumaNeprev = filteredExpenses
    .filter((e) => e.categorie === "neprevazut")
    .reduce((s, e) => s + e.suma, 0);
  const sumaPierderi = filteredExpenses
    .filter((e) => e.categorie === "pierdere")
    .reduce((s, e) => s + e.suma, 0);
  const procNeprev = oferteTotal > 0 ? (sumaNeprev / oferteTotal) * 100 : 0;
  const procPierderi = oferteTotal > 0 ? (sumaPierderi / oferteTotal) * 100 : 0;

  // Calendar obligatii — sold progresiv (fara reasignare, React Compiler)
  const soldProgresiv = events60.map((ev, i) => ({
    ...ev,
    sold: soldCurent - events60.slice(0, i + 1).reduce((s, e) => s + e.suma, 0),
  }));

  const lunaLabel = new Date(today + "T00:00:00").toLocaleDateString("ro-RO", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Privire de ansamblu — {lunaLabel}</p>
        </div>
        <DeclaratToggle value={declarat} onChange={setDeclarat} />
      </div>

      {/* KPI-uri */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KpiCard
          label={`Venituri (${qCur.label})`}
          value={formatEur(venitCur)}
          delta={
            deltaVenit === null
              ? undefined
              : { value: `${Math.abs(deltaVenit)}% vs trim. anterior`, positive: deltaVenit >= 0 }
          }
        />
        <KpiCard
          label={`Cheltuieli (${qCur.label})`}
          value={formatEur(cheltCur)}
          delta={
            deltaChelt === null
              ? undefined
              : { value: `${Math.abs(deltaChelt)}% vs trim. anterior`, positive: deltaChelt < 0 }
          }
        />
        <KpiCard label="Profit net" value={formatEur(profitNet)} subtitle="trimestrul curent" />
        <KpiCard label="Marjă brută" value={`${marja.toFixed(1)} %`} subtitle="trimestrul curent" />
      </div>

      {/* Structura cheltuieli + Calibrator */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Structura cheltuieli pe grupe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cheltuieliPeGrupa.map((c) => (
                <div key={c.key}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{c.label}</span>
                    <span className="font-medium tabular-nums">{formatEur(c.suma)}</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-foreground"
                      style={{ width: `${(c.suma / maxGrupa) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {!includeManopera && (
              <p className="mt-3 text-xs text-muted-foreground">
                Manopera nu are marcaj facturat/nefacturat — apare doar pe vizualizarea „Tot”.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calibrator marjă</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Neprevăzute</span>
                <span className="font-medium tabular-nums">{procNeprev.toFixed(1)}%</span>
              </div>
              <div className="text-xs text-muted-foreground">
                țintă: {marjaNeprevSetata}% · real: {procNeprev.toFixed(1)}%
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-amber-500"
                  style={{
                    width: `${Math.min((procNeprev / Math.max(marjaNeprevSetata, 0.1)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pierderi</span>
                <span className="font-medium tabular-nums">{procPierderi.toFixed(1)}%</span>
              </div>
              <div className="text-xs text-muted-foreground">
                țintă: {marjaPierderiSetata}% · real: {procPierderi.toFixed(1)}%
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-rose-500"
                  style={{
                    width: `${Math.min((procPierderi / Math.max(marjaPierderiSetata, 0.1)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className="rounded-md bg-muted/50 p-3 text-xs">
              <div className="font-medium">Recomandare buffer minim</div>
              <div className="mt-1 text-muted-foreground">
                Pe baza valorilor reale: ≥ {Math.ceil(procNeprev + procPierderi + 2)}% pentru
                marjă sigură
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend 6 luni */}
      <Card>
        <CardHeader>
          <CardTitle>Trend ultimele 6 luni</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-3">
            {trend.map((t) => (
              <div key={t.key} className="space-y-1 text-center">
                <div className="flex h-32 items-end justify-center gap-1">
                  <div
                    className="w-4 rounded-t bg-emerald-500"
                    style={{ height: `${(t.venit / maxTrend) * 100}%` }}
                    title={`Venit: ${formatEur(t.venit)}`}
                  />
                  <div
                    className="w-4 rounded-t bg-rose-400"
                    style={{ height: `${(t.cheltuieli / maxTrend) * 100}%` }}
                    title={`Cheltuieli: ${formatEur(t.cheltuieli)}`}
                  />
                </div>
                <div className="text-xs text-muted-foreground">{t.luna}</div>
                <div className="text-xs font-medium tabular-nums">
                  {formatEur(t.venit - t.cheltuieli)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-emerald-500" /> Venituri
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-rose-400" /> Cheltuieli
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar obligatii 60 zile */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar obligații — următoarele 60 zile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Sold curent firmă:{" "}
              <span className="font-semibold text-foreground">{formatEur(soldCurent)}</span>
              <span className="ml-2 text-xs">(actualizat {formatDate(soldUpdatedAt)})</span>
            </span>
          </div>
          <div className="space-y-1">
            {soldProgresiv.map((ev, i) => {
              const culoare =
                ev.sold < 500
                  ? "text-rose-600 bg-rose-50"
                  : ev.sold < 2000
                    ? "text-amber-600 bg-amber-50"
                    : "text-emerald-700 bg-emerald-50";
              return (
                <div
                  key={i}
                  className="grid grid-cols-4 items-center gap-3 rounded-md border px-3 py-2 text-sm"
                >
                  <div className="text-muted-foreground">{formatDate(ev.data)}</div>
                  <div className="font-medium">{ev.descriere}</div>
                  <div className="text-right font-medium tabular-nums text-rose-600">
                    − {formatEur(ev.suma)}
                  </div>
                  <div
                    className={`rounded px-2 py-1 text-right text-xs font-medium tabular-nums ${culoare}`}
                  >
                    Sold est: {formatEur(ev.sold)}
                  </div>
                </div>
              );
            })}
            {events60.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-6">
                Nicio obligație programată în următoarele 60 zile
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
