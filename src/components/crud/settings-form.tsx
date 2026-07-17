"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import type { ActionResult } from "@/lib/actions/helpers";

/**
 * Formular inline (fara dialog) pentru paginile de setari: trimite FormData
 * catre un server action, arata eroarea sau confirmarea "Salvat" 2 secunde.
 */
export function SettingsForm({
  action,
  submitLabel = "Salvează",
  resetOnSuccess = false,
  children,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  submitLabel?: string;
  /** goleste campurile dupa succes (ex: parola) */
  resetOnSuccess?: boolean;
  children: React.ReactNode;
}) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
        setSaved(false);
      } else {
        setError(null);
        setSaved(true);
        if (resetOnSuccess) formRef.current?.reset();
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <form ref={formRef} action={submit} className="space-y-4">
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending} variant={saved ? "secondary" : "default"}>
        {saved ? (
          <>
            <Check className="mr-1 size-4" />
            Salvat
          </>
        ) : pending ? (
          "Se salvează..."
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
