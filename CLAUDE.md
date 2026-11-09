# MoneyTrail — demo de portofoliu (fără backend)

Aplicație-vitrină publică: gestiune proiecte/cheltuieli/manoperă/marjă cu date fictive.
Live: https://moneytrail-topaz.vercel.app · Repo: soranaroman/money-trail

## Reguli permanente

- **Fără backend, prin design.** Nu adăuga bază de date, auth sau server actions — tot stratul
  de date e client-side: `src/lib/data-context.tsx` (CRUD + validări + localStorage),
  `src/lib/seed.ts` (date fictive), `src/lib/derive.ts` (agregate pure). Paginile sunt
  client components care citesc `useData()`.
- `src/lib/seed.ts` a fost generat de un script determinist care NU s-a păstrat (nu e în repo).
  Se modifică doar prin înlocuiri mecanice de texte (un nume schimbat peste tot unde apare), fără
  editări de structură. Datele calendaristice se rezolvă la runtime relativ la ziua curentă
  (`freshSeed()`), ca demo-ul să arate populat oricând.
- **Zero referințe la clientul real** (nume de firmă, domeniu, persoane, cifre reale). Aplicația
  provine dintr-un proiect de client; copia asta trebuie să rămână complet anonimizată.
  Verificare rapidă: `grep -ri tomas src/`.
  Furnizorii, clienții și persoanele din seed sunt inventați. Singurele nume reale acceptate sunt
  marile lanțuri publice (Repsol, BP, Cepsa, Leroy Merlin, Würth, Vodafone). Orice nume nou se
  verifică întâi față de fișierele-sursă ale clientului (în folderul proiectului-sursă, nu în repo).
- Eticheta din UI e **„Facturat / Nefacturat”** — câmpul de date rămâne `declarat` (nu redenumi
  câmpul, doar textele vizibile).
- Paletă neutră (zinc) în `globals.css` — nu reintroduce culorile de brand ale clientului.
- Base UI: `render={<X/>}` (nu asChild); Select MEREU cu prop `items` pe Root, altfel triggerul
  afișează valoarea brută. React Compiler ON: fără `useMemo` manual, fără reasignări în render.

## Comenzi

- `npm run dev -- -p 3100` · `npm run build` · `npm run lint` (build+lint curate înainte de commit)
- Deploy (doar la cererea userului): `~/.npm-global/bin/vercel --prod --yes`
