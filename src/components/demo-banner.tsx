import { TriangleAlert } from "lucide-react";

/**
 * Marcheaza paginile inca neconectate la baza de date. Se scoate de pe
 * fiecare pagina in etapa in care modulul ei devine functional.
 */
export function DemoBanner({ etapa }: { etapa: number }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
      <TriangleAlert className="size-4 shrink-0" />
      <span>
        <strong>Machetă — datele de mai jos sunt fictive.</strong> Modulul acesta devine
        funcțional în Etapa {etapa}.
      </span>
    </div>
  );
}
