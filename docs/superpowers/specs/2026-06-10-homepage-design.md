# AlgoClar Homepage — Design Spec

**Date:** 2026-06-10  
**Route:** `/` → `app/page.tsx`  
**Type:** Server Component, fully static (SSG)  
**Commit target:** `feat: homepage`

---

## Architecture

Single file `app/page.tsx` exports a default Server Component. No `"use client"` on the page itself.  
One new component: `components/home/BinarySearchPreview.tsx` — static, no interactivity, no client directive needed.

All styles via Tailwind utilities + design tokens from `app/globals.css`. No hardcoded colors.

---

## Metadata (SEO — română)

```tsx
export const metadata: Metadata = {
  title: 'AlgoClar — Înțelegi algoritmica, nu o memorezi',
  description:
    'Platformă educațională de algoritmică pentru elevi români din clasele V–XI. Lecții scurte, vizualizări interactive și arhivă OJI/ONI 2021–2026 explicată pas cu pas.',
  keywords: [
    'algoritmica', 'OJI', 'ONI', 'informatică', 'programare',
    'elevi', 'gimnaziu', 'liceu', 'căutare binară', 'programare dinamică',
  ],
  openGraph: {
    title: 'AlgoClar — Înțelegi algoritmica, nu o memorezi',
    description: 'Lecții scurte, vizualizări interactive, arhivă OJI/ONI explicată.',
    type: 'website',
    locale: 'ro_RO',
  },
}
```

---

## Section 1 — Hero

**Layout:** 2 columns on `lg`, stacked on mobile. Full viewport-ish, `py-20 lg:py-28`.

**Left column:**
- Eyebrow pill: `bg-accent text-accent-foreground`, text "Clasele V–XI · OJI/ONI 2021–2026", mono 12px
- Display title: Sora 800, `text-4xl lg:text-5xl xl:text-6xl`, two lines:
  - "Înțelegi algoritmica,"
  - `<span class="text-primary">` "nu o memorezi."
- Subheading: `text-lg text-muted-foreground`, max-w-md: "Lecții scurte, vizualizări interactive și arhivă OJI/ONI explicată pentru clasele V–XI."
- CTAs (flex gap-3):
  - Primary button: "Începe să înveți →" → `/invata`
  - Ghost/outline button: "Arhivă OJI/ONI" → `/arhiva`

**Right column:**
- `BinarySearchPreview` component (see below), max-w-lg

---

## Component: BinarySearchPreview

File: `components/home/BinarySearchPreview.tsx`

Static card (`bg-card border border-border rounded-[16px] p-6`) showing a frozen frame of binary search step 3/5.

**Header:** mono label "Căutare binară · pas 3 din 5" + badge `bg-accent text-accent-foreground` "Demo"

**Array:** 7 cells `[3, 7, 12, 19, 25, 31, 42]`, inline-flex, each cell `w-10 h-10 rounded-[8px] border font-mono text-sm font-semibold flex items-center justify-center`.

Cell color states:
- Default: `bg-muted text-muted-foreground border-border`
- L..mid-1 (indices 0-2): muted
- mid (index 3, value 19): `bg-primary text-primary-foreground border-primary` (highlighted)
- mid+1..R (indices 4-6): muted/lighter

**Pointer labels:** row of mono labels below each cell — "L", "", "", "M", "", "", "R" — mono 11px, `text-muted-foreground`, centered under each cell.

**Status line:** mono `text-sm text-foreground` — "19 < 25 → caută în dreapta"

**Static controls row:** 4 icon buttons (decorative, `pointer-events-none opacity-60`) — Reset, Prev, Play, Next — same visual as PlayerControls spec. Separator between Prev and Play.

No `onClick`, no state, no `"use client"`.

---

## Section 2 — Cum înveți

**Title:** "Cum înveți pe AlgoClar" — Sora h2 centered  
**Subtitle:** "Fiecare concept explicat de la zero, pas cu pas." — muted-foreground centered

**Grid:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`

4 cards (`bg-card border border-border rounded-[16px] p-6 flex flex-col gap-4`):

| # | Icon | Title | Description |
|---|------|-------|-------------|
| 1 | `BookOpen` (primary) | Lecții scurte | Maxim 15 minute per concept, fără teorie inutilă. |
| 2 | `Play` (secondary) | Vizualizări interactive | Rulezi algoritmul pas cu pas, nu îl citești. |
| 3 | `Archive` (warning) | Arhivă OJI/ONI | Probleme din 2021–2026 explicate cu abordare completă. |
| 4 | `TrendingUp` (success) | Progres personal | Urmărești ce ai rezolvat, ce ai de reluat. |

Icon wrapper: `w-10 h-10 rounded-[10px] bg-accent flex items-center justify-center`, icon `w-5 h-5 text-primary` (variantă culoare per card în implementare).

---

## Section 3 — Alege clasa ta

**Title:** "Alege clasa ta" — Sora h2  
**Subtitle:** "Curriculum adaptat pe clasă, de la noțiuni de bază până la baraj ONI." — muted-foreground

**Grid:** `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4`

7 cards, classes V–XI (grade 5–11):

| Grade | Label | School level |
|-------|-------|-------------|
| 5 | Clasa a V-a | Gimnaziu |
| 6 | Clasa a VI-a | Gimnaziu |
| 7 | Clasa a VII-a | Gimnaziu |
| 8 | Clasa a VIII-a | Gimnaziu |
| 9 | Clasa a IX-a | Liceu |
| 10 | Clasa a X-a | Liceu |
| 11 | Clasa a XI-a | Liceu |

Each card: `Link href="/invata/{grade}"`, `bg-card border border-border rounded-[16px] p-5 flex flex-col gap-2 hover:border-primary hover:-translate-y-[2px] transition-all duration-[180ms]`.  
Content: grade number large (Sora 700 2xl) + school level pill mono small.

---

## Section 4 — Arhivă OJI/ONI

**Title:** "Arhivă OJI/ONI 2021–2026" — Sora h2  
**Subtitle:** "Probleme explicate cu abordare, soluție comentată și link la sursă oficială."

**Grid:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`

3 placeholder `ProblemCard` components with realistic sample data:
1. OJI 2024 · clasa 9 · "Subsecvență de sumă maximă" · topics: ["DP"] · status: "explicata"
2. ONI 2023 · clasa 10 · "Arbore cu costuri minime" · topics: ["Grafuri", "Arbori"] · status: "linkuita"
3. OJI 2022 · clasa 11 · "Șir de caractere" · topics: ["Strings", "Hashing"] · status: "in-lucru"

**CTA:** centered button/link "Vezi toată arhiva OJI/ONI →" → `/arhiva`

---

## Section 5 — Premium

**Background:** `bg-accent` (subtle tint, not full color), `rounded-[24px]`, padded section inside the max-w container.

**Badge:** "Premium" — `bg-primary text-primary-foreground` pill, centered  
**Title:** "Deblochează tot conținutul" — Sora h2 centered  
**Subtitle:** "Vizualizări avansate, arhivă completă și progres detaliat." muted-foreground

**3 feature bullets** (flex col, gap-3, max-w-sm mx-auto):
- ✓ Toate vizualizările interactive
- ✓ Arhivă OJI/ONI completă cu explicații
- ✓ Statistici și progres personal

Each bullet: `Check` icon `text-success` + text

**Price/CTA:** "Curând disponibil" badge `bg-muted text-muted-foreground` + disabled button "Notifică-mă"

---

## File Map

```
app/page.tsx                            ← replace stub, full homepage
components/home/BinarySearchPreview.tsx ← new, static, no "use client"
```

No other files touched.

---

## Constraints

- Zero `"use client"` — all static markup
- No hardcoded colors — all CSS variable tokens
- `BinarySearchPreview` controls: `pointer-events-none opacity-60`, decorative only
- Romanian labels everywhere
- ProblemCard placeholder data: no real OJI/ONI statement text — original descriptions
- Grade links: `/invata/5` through `/invata/11` (numeric slug)
