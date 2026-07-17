import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  delta?: { value: string; positive: boolean };
  subtitle?: string;
};

export function KpiCard({ label, value, delta, subtitle }: Props) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-bold tracking-tight">{value}</div>
        {delta && (
          <div
            className={cn(
              "mt-1 text-xs font-medium",
              delta.positive ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {delta.positive ? "↑" : "↓"} {delta.value}
          </div>
        )}
        {subtitle && (
          <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>
        )}
      </CardContent>
    </Card>
  );
}
