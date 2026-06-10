# AlgoClar — Design Tokens & Component Reference

> Referința unică pentru implementare. Sursa de adevăr pentru tokens trăiește în
> `tokens/tokens.css` și `tokens/tokens.json` (importate direct în cod).
> Documentul ăsta e referința umană — la el te întorci când construiești componente.

- **Fonturi:** Sora (heading) · IBM Plex Sans (body) · JetBrains Mono (mono) — toate cu diacritice românești complete.
- **Culori:** format HSL, compatibil shadcn/ui. Folosire: `hsl(var(--primary))` sau cu alfa `hsl(var(--primary) / 0.5)`.
- **Mapare brand → shadcn:** `primary` = albastru electric · `secondary` = violet · `accent` = tint de albastru (hover / butoane soft). `success`, `warning` și `--code` sunt în plus față de setul standard shadcn.

---

## 1. Culori — CSS custom properties

Fișier sursă: [`tokens/tokens.css`](../tokens/tokens.css)

```css
/* shadcn/ui compatible · HSL channels (no hsl() wrapper) */

:root {
  /* surfaces & text */
  --background: 45 33% 98%;            /* #FBFAF7 warm white */
  --foreground: 224 33% 11%;           /* #131826 blue-black */
  --card: 0 0% 100%;                   /* #FFFFFF */
  --card-foreground: 224 33% 11%;
  --popover: 0 0% 100%;
  --popover-foreground: 224 33% 11%;

  /* brand & semantic */
  --primary: 222 100% 59%;             /* #2D6BFF electric blue */
  --primary-foreground: 0 0% 100%;
  --secondary: 252 92% 66%;            /* #7A5AF8 violet */
  --secondary-foreground: 0 0% 100%;
  --accent: 223 100% 96%;              /* #EAF0FF blue tint */
  --accent-foreground: 222 100% 59%;
  --muted: 220 12% 95%;                /* #F1F2F4 */
  --muted-foreground: 220 11% 47%;     /* #6B7486 */
  --destructive: 0 67% 58%;            /* #DB4B4B discreet red */
  --destructive-foreground: 0 0% 100%;
  --success: 142 76% 36%;              /* #16A34A */
  --success-foreground: 0 0% 100%;
  --warning: 38 90% 48%;               /* #EA9A0C */
  --warning-foreground: 224 33% 11%;

  /* lines & focus */
  --border: 43 13% 89%;                /* #E7E5E0 */
  --input: 43 13% 89%;
  --ring: 222 100% 59%;                /* #2D6BFF */

  /* code blocks */
  --code: 222 43% 10%;                 /* #0F1626 dark code bg */
  --code-foreground: 219 40% 85%;      /* #C9D4E8 */

  --radius: 0.625rem;                  /* 10px base (buttons) */
}

.dark {
  --background: 223 39% 9%;            /* #0E1320 */
  --foreground: 218 35% 94%;           /* #EAEEF5 */
  --card: 221 27% 12%;                 /* #161B26 */
  --card-foreground: 218 35% 94%;
  --popover: 221 27% 12%;
  --popover-foreground: 218 35% 94%;

  --primary: 224 100% 68%;             /* #5B86FF */
  --primary-foreground: 224 41% 7%;    /* #0B0F1A */
  --secondary: 250 100% 76%;           /* #9B86FF */
  --secondary-foreground: 224 41% 7%;
  --accent: 224 41% 18%;               /* #1B2540 */
  --accent-foreground: 229 100% 81%;   /* #9FB1FF */
  --muted: 222 26% 15%;                /* #1C2230 */
  --muted-foreground: 215 13% 65%;     /* #9AA4B2 */
  --destructive: 0 84% 68%;            /* #F26B6B */
  --destructive-foreground: 0 41% 7%;
  --success: 149 59% 49%;              /* #34C77B */
  --success-foreground: 148 41% 7%;
  --warning: 40 89% 60%;               /* #F4B740 */
  --warning-foreground: 224 41% 7%;

  --border: 218 22% 19%;               /* #262E3C */
  --input: 218 22% 19%;
  --ring: 224 100% 68%;                /* #5B86FF */

  --code: 223 41% 7%;                  /* #0A0E18 */
  --code-foreground: 219 40% 85%;
}
```

### Referință HEX (pentru tooling care nu acceptă HSL)

| Token | Light | Dark |
|---|---|---|
| background | `#FBFAF7` | `#0E1320` |
| foreground | `#131826` | `#EAEEF5` |
| card | `#FFFFFF` | `#161B26` |
| primary | `#2D6BFF` | `#5B86FF` |
| secondary | `#7A5AF8` | `#9B86FF` |
| accent | `#EAF0FF` | `#1B2540` |
| muted | `#F1F2F4` | `#1C2230` |
| muted-foreground | `#6B7486` | `#9AA4B2` |
| destructive | `#DB4B4B` | `#F26B6B` |
| success | `#16A34A` | `#34C77B` |
| warning | `#EA9A0C` | `#F4B740` |
| border / input | `#E7E5E0` | `#262E3C` |
| code (bg) | `#0F1626` | `#0A0E18` |
| code-foreground | `#C9D4E8` | `#C9D4E8` |

---

## 2. Scale — fonturi, spacing, radius, shadow

Fișier sursă: [`tokens/tokens.json`](../tokens/tokens.json)

```json
{
  "fontFamily": {
    "heading": "Sora",
    "body": "IBM Plex Sans",
    "mono": "JetBrains Mono"
  },
  "fontSize": {
    "display": { "px": 56, "rem": "3.5rem",   "lineHeight": 1.05, "weight": 800, "family": "heading" },
    "h1":      { "px": 40, "rem": "2.5rem",   "lineHeight": 1.1,  "weight": 700, "family": "heading" },
    "h2":      { "px": 28, "rem": "1.75rem",  "lineHeight": 1.15, "weight": 700, "family": "heading" },
    "h3":      { "px": 22, "rem": "1.375rem", "lineHeight": 1.2,  "weight": 600, "family": "heading" },
    "bodyLg":  { "px": 18, "rem": "1.125rem", "lineHeight": 1.6,  "weight": 400, "family": "body" },
    "body":    { "px": 16, "rem": "1rem",     "lineHeight": 1.6,  "weight": 400, "family": "body" },
    "small":   { "px": 14, "rem": "0.875rem", "lineHeight": 1.5,  "weight": 500, "family": "body" },
    "code":    { "px": 15, "rem": "0.9375rem","lineHeight": 1.7,  "weight": 400, "family": "mono" },
    "label":   { "px": 11, "rem": "0.6875rem","letterSpacing": "0.06em", "transform": "uppercase", "family": "mono" }
  },
  "spacing": {
    "base": 4,
    "px": { "1":4, "2":8, "3":12, "4":16, "5":20, "6":24, "8":32, "10":40, "12":48, "16":64, "20":80, "24":96 }
  },
  "borderRadius": {
    "sm": "6px",
    "md": "10px",
    "lg": "16px",
    "xl": "24px",
    "pill": "9999px"
  },
  "shadow": {
    "card":  { "light": "0 1px 2px rgba(19,24,38,.04)", "dark": "0 1px 2px rgba(0,0,0,.30)" },
    "hover": { "light": "0 14px 32px -14px rgba(19,24,38,.22)", "dark": "0 16px 36px -14px rgba(0,0,0,.60)" },
    "focusRing": "0 0 0 3px hsl(var(--ring) / .35)"
  }
}
```

**borderRadius — utilizare:** `sm` badge/input · `md` button · `lg` card · `xl` panel · `pill` status pill, slider track.

**Import fonturi (o singură dată):**

```html
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
```

---

## 3. Specificații per componentă

Tokens, padding, radius și comportamentul stărilor. Tints-urile sunt exprimate ca
`hsl(var(--token) / .12)` ca să funcționeze identic în light și dark din aceleași variabile.

### LessonCard
- **Container:** bg `--card`, border 1px `--border`, radius `16px (lg)`, padding `22px`, shadow `card`; flex column, gap `14px`.
- **Capitol:** eyebrow mono `11px` uppercase, culoare `--muted-foreground`.
- **Titlu:** Sora `600 / 20px`, culoare `--card-foreground`.
- **Meta:** `13px` `--muted-foreground`; iconuri (ceas) mai estompate.
- **Dificultate:** badge în dreapta-sus (vezi *Badge dificultate*).
- **Progres:** track `height 7px`, radius `pill`, bg `--muted`; fill bg `--primary`; valoarea în mono `--primary`.
- **Stări:**
  - `hover` → border `--primary`, shadow `hover`, `translateY(-3px)`, tranziție `.18s`.
  - `completat` → border `--success`; fill `--success` la `100%`; valoarea devine „Completat" cu bifă, culoare `--success`.

### ProblemCard
- **Container:** bg `--card`, border 1px `--border`, radius `16px`, padding `20px 22px`, shadow `card`; gap `14px`.
- **Etapă:** tag mono `11px / 700`, text alb; bg `--primary` pentru OJI, `--secondary` (violet) pentru ONI; padding `4px 8px`, radius `6px`.
- **An · clasă:** mono `12px` `--muted-foreground`.
- **Titlu:** Sora `600 / 18px`, `--card-foreground`.
- **Tehnici:** șir de badge-uri tehnică (outline neutru).
- **Footer:** separator sus 1px `--border`, padding-top `12px`; status pills la stânga, săgeată `--muted-foreground` la dreapta.
- **Stări:**
  - `hover` → border `--primary`, shadow `hover`, `translateY(-3px)`.
  - `activ` (selectat în listă) → border `--secondary` + inset ring 1px `--secondary`.

### Badge dificultate
mono `12px / 500`, padding `5px 10px`, radius `6px`, punct `6px`. Culoarea de bază la `~12%` alfa pe fundal + textul la culoarea plină:

| Nivel | Background | Text |
|---|---|---|
| bază | `hsl(var(--success) / .12)` | `--success` |
| mediu | `--accent` | `--primary` |
| greu | `hsl(var(--warning) / .14)` | `--warning` |
| baraj | `hsl(var(--secondary) / .12)` | `--secondary` |

- **Badge tehnică** (DP, grafuri…): bg transparent, border 1px `--border`, text `--muted-foreground`, mono `11.5px`, padding `4px 9px`, radius `6px`. Variantă accent: border + text `--primary`, bg `--accent`.
- **Status:** pill radius. `explicată` = success + bifă · `linkuită` = primary + link · `în lucru` = muted.
- Badge-urile sunt **statice** — hover-ul aparține cardului-părinte.

### HintBox
- **Container:** bg `--card`, radius `14px`, padding `18px 20px`, border-left `3px --primary`; flex gap `14px`.
- **Iconiță:** chip `34px`, radius `9px`, bg `--accent`, icon `--primary` (bec).
- **Titlu:** „Indiciu" — `13px / 600` uppercase, culoare `--primary`.
- **Text:** `14.5px`, line-height `1.55`, `--foreground`; cod inline bg `--muted`, mono `13px`.
- **Stare:** static, informativ — fără hover.

### ObservationBox
- **Container:** bg `hsl(var(--secondary) / .08)` (violet tint), border-left `3px --secondary`, radius `14px`, padding `18px 20px`.
- **Iconiță:** chip `34px`, bg `--secondary` plin, icon alb (steluță = observația-cheie).
- **Titlu:** „Observația-cheie" — `13px / 600` uppercase, `--secondary`.
- **Text:** identic cu HintBox; accent vizual mai puternic fiindcă marchează ideea centrală.
- **Stare:** static.

### MistakeBox
- **Container:** bg `--card`, border-left `3px --destructive`, radius `14px`, padding `18px 20px`.
- **Iconiță:** chip `34px`, bg `hsl(var(--destructive) / .12)`, icon `--destructive` (triunghi atenție).
- **Titlu:** „Greșeli frecvente" — `13px / 600` uppercase, `--destructive`.
- **Ton:** roșu discret — semnalează, nu alarmează. Fără fundal roșu plin.
- **Stare:** static.

### PlayerControls
- **Container:** bg `--card`, border 1px `--border`, radius `14px`, padding `10px 14px`, shadow `card`; flex gap `8px`, `width: fit-content`.
- **Butoane:** iconă `38px` pătrat, radius `9px`, transparent, icon `--foreground`. Ordine: Reset · Prev · Play/Pause · Next.
- **Buton play:** `44px`, radius `11px`, bg `--primary`, icon alb; comută Play↔Pause după stare.
- **Separator:** 1px × `26px`, `--border`.
- **Slider viteză:** track `5px` radius pill bg `--muted`; thumb `16px` cerc bg `--primary`, border 2px `--card`; valoare mono `--primary`; range `0.5×–3×`, pas `0.5`.
- **Stări:**
  - `hover btn` → bg `--muted`, icon `--foreground`.
  - `hover play` → bg `--primary` mai închis (în light `#1E54E6`).
  - `rulează` → butonul primar arată iconul Pause; valoarea vitezei se actualizează live.

---

*AlgoClar · Design Tokens v1.0 · © 2026*
