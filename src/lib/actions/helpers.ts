// Utilitare pure pentru parsarea FormData (fără backend — demo local).

export type ActionResult = { error: string } | undefined;

export function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/** Camp text optional → null in loc de string gol. */
export function strOrNull(formData: FormData, key: string): string | null {
  const v = str(formData, key);
  return v === "" ? null : v;
}

/** Numar din input (accepta si virgula zecimala). NaN daca lipseste/invalid. */
export function num(formData: FormData, key: string): number {
  const v = str(formData, key).replace(",", ".");
  return v === "" ? NaN : Number(v);
}
