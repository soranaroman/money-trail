"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type SortDir = "asc" | "desc";
export type SortState<K extends string> = { key: K; dir: SortDir } | null;

/**
 * Ciclul la click: prima direcție → cealaltă → fără sortare.
 * `firstDir` = direcția primului click (desc pentru sume, asc pentru nume).
 */
export function toggleSort<K extends string>(
  current: SortState<K>,
  key: K,
  firstDir: SortDir = "desc"
): SortState<K> {
  if (!current || current.key !== key) return { key, dir: firstDir };
  const second: SortDir = firstDir === "desc" ? "asc" : "desc";
  return current.dir === firstDir ? { key, dir: second } : null;
}

/** Sorteaza stabil dupa getter (numar sau string, ro-aware pentru stringuri). */
export function sortRows<T>(rows: T[], dir: SortDir, get: (row: T) => number | string): T[] {
  const mul = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const va = get(a);
    const vb = get(b);
    if (typeof va === "string" || typeof vb === "string") {
      return String(va).localeCompare(String(vb), "ro") * mul;
    }
    return (va - vb) * mul;
  });
}

export function SortableHead<K extends string>({
  label,
  sortKey,
  sort,
  onToggle,
  firstDir = "desc",
  align = "left",
  className,
}: {
  label: string;
  sortKey: K;
  sort: SortState<K>;
  onToggle: (key: K, firstDir: SortDir) => void;
  firstDir?: SortDir;
  align?: "left" | "right";
  className?: string;
}) {
  const active = sort?.key === sortKey;
  return (
    <TableHead className={cn(align === "right" && "text-right", className)}>
      <button
        type="button"
        onClick={() => onToggle(sortKey, firstDir)}
        className={cn(
          "inline-flex items-center gap-1 select-none hover:text-foreground",
          active && "text-foreground font-semibold"
        )}
        aria-label={`Sortează după ${label}`}
      >
        {label}
        {active ? (
          sort!.dir === "asc" ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowDown className="size-3.5" />
          )
        ) : (
          <ArrowUpDown className="size-3.5 opacity-40" />
        )}
      </button>
    </TableHead>
  );
}
