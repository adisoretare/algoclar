# AlgoClar — Context proiect

## Ce construim

Platformă educațională de algoritmică pentru elevi români (clasele V–XII):
lecții scurte + vizualizări interactive + arhivă explicată OJI/ONI 2021–2026.
Slogan: "Înțelegi algoritmica, nu o memorezi."

## Stack

- Next.js (App Router) + TypeScript strict, pnpm
- Tailwind CSS + shadcn/ui, dark mode
- Conținut (lecții + probleme): fișiere MDX în repo — NU în baza de date
- DB (DOAR date de utilizator): Supabase Postgres, cu RLS
- Auth: Supabase Auth (@supabase/ssr)
- Plăți: Stripe Billing
- Deploy: Vercel

## Principii

- Server Components by default; "use client" doar pentru interactivitate.
- Conținutul public = static (SSG) pentru SEO și viteză.
- Toate culorile/spacing prin design tokens (CSS variables + Tailwind),
  NICIODATĂ hardcodate în componente.
- Vizualizările folosesc TOATE același step-engine (useStepPlayer +
  VisualizerShell). Nu duplica logica de player.
- Accesibilitate: vizualizările navigabile din tastatură, contrast AA.
- Teste pentru logica din lib/ (content loaders, step-engine, access-control).

## Convenții

- Limba UI + conținut: română. Rute: /invata, /arhiva, /vizualizari,
  /dashboard, /premium.
- Înainte de task-uri mari: propune planul, așteaptă OK-ul meu.
- NU rula migrări/comenzi distructive fără confirmarea mea explicită.
- Pentru chei/secrete: spune-mi ce env vars să setez; nu le inventa.

## Ce NU facem

- Judge propriu (linkuim pbinfo/kilonova/infoarena). Forum. App mobilă.
- NU copiem enunțuri/teste oficiale — doar link la sursa oficială +
  explicații originale.
