import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  /** Variatia fata de perioada anterioara. Semnul lui `percent` da DIRECTIA sagetii,
   *  iar `goodWhenUp` da CULOAREA (la cheltuieli o crestere e rea, deci false). */
  delta?: { percent: number; note: string; goodWhenUp: boolean };
  subtitle?: string;
};

/** Directia si sentimentul sunt lucruri diferite — se calculeaza separat. */
function trendOf(delta: NonNullable<Props["delta"]>) {
  if (delta.percent === 0) return { arrow: "→", className: "text-muted-foreground" };
  const up = delta.percent > 0;
  return {
    arrow: up ? "↑" : "↓",
    className: up === delta.goodWhenUp ? "text-emerald-600" : "text-rose-600",
  };
}

export function KpiCard({ label, value, delta, subtitle }: Props) {
  const trend = delta ? trendOf(delta) : null;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-bold tracking-tight">{value}</div>
        {delta && trend && (
          <div className={cn("mt-1 text-xs font-medium", trend.className)}>
            {trend.arrow} {Math.abs(delta.percent)}% {delta.note}
          </div>
        )}
        {subtitle && (
          <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>
        )}
      </CardContent>
    </Card>
  );
}
