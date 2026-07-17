# MoneyTrail

Aplicație de gestiune pentru firme mici de execuție (tâmplărie, construcții, amenajări): urmărește **proiecte, cheltuieli, manoperă, încasări și marja reală** pe fiecare lucrare.

> **Demo interactiv, cu date fictive.** Nu există backend sau bază de date — toate datele trăiesc în browser. Poți adăuga/edita/șterge liber; butonul **„Resetează demo”** readuce setul inițial. Fiecare vizitator primește propria copie.

## Ce face

- **Dashboard** — venituri/cheltuieli/profit pe trimestrul curent vs. cel anterior, structura cheltuielilor pe grupe, trend pe 6 luni, calibrator de marjă și calendarul obligațiilor pe 60 de zile.
- **Proiecte** — ofertă vs. cost real vs. profit și marjă, per lucrare; filtre pe status/client, sortare pe orice coloană.
- **Cheltuieli** — grupe cu categorii; o cheltuială poate fi nealocată, alocată unui proiect, sau **împărțită între mai multe** (cu verificare de echilibru).
- **Manoperă** — angajați cu rată/zi + grilă săptămânală (angajat × proiect × zile); costul intră automat în marja proiectului.
- **Deplasări** — raport pe localități (cazare / combustibil / diurnă).
- **Obligații** — plăți recurente expandate într-un calendar pe 60 de zile, cu sold progresiv și praguri de alertă.
- **Rapoarte** — defalcare de costuri per proiect, filtre pe perioadă, **export CSV și Excel**.
- Marcaj **facturat / nefacturat** pe orice tranzacție, cu filtrare peste tot.

## Detalii tehnice

- **Next.js 16** (App Router, Turbopack) · **React 19** cu React Compiler · **TypeScript**
- **Tailwind v4** + **Base UI** pentru componente accesibile
- Stratul de date: **React Context + localStorage**, alimentat dintr-un seed determinist. Datele calendaristice se generează relativ la ziua curentă, deci dashboard-ul arată populat oricând e vizitat.
- Toate agregatele (marjă, cost real, sold progresiv, trend) se calculează în client — fără server.

## Rulare locală

```bash
npm install
npm run dev
```

Apoi deschide http://localhost:3000
