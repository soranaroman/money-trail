"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type DeclaratFilter = "tot" | "declarat" | "nedeclarat";

type Props = {
  value?: DeclaratFilter;
  onChange?: (v: DeclaratFilter) => void;
};

export function DeclaratToggle({ value, onChange }: Props) {
  const [internal, setInternal] = useState<DeclaratFilter>("tot");
  const current = value ?? internal;
  const set = (v: DeclaratFilter) => {
    setInternal(v);
    onChange?.(v);
  };

  const options: { value: DeclaratFilter; label: string }[] = [
    { value: "tot", label: "Tot" },
    { value: "declarat", label: "Doar facturate" },
    { value: "nedeclarat", label: "Doar nefacturate" },
  ];

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border bg-muted/50 p-1 text-sm">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => set(o.value)}
          className={cn(
            "rounded-md px-3 py-1 transition-colors",
            current === o.value
              ? "bg-background shadow-sm font-medium"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
