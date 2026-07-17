"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/actions/helpers";

export function DeleteButton({
  action,
  id,
  confirmMessage,
  label,
  redirectTo,
}: {
  action: (id: string) => Promise<ActionResult>;
  id: string;
  confirmMessage: string;
  label?: string;
  /** navighează aici după ștergere reușită (ex. înapoi la listă) */
  redirectTo?: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      size={label ? "sm" : "icon"}
      className="text-muted-foreground hover:text-destructive"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirmMessage)) return;
        startTransition(async () => {
          const result = await action(id);
          if (result?.error) window.alert(result.error);
          else if (redirectTo) router.push(redirectTo);
        });
      }}
    >
      <Trash2 className="size-4" />
      {label}
    </Button>
  );
}
