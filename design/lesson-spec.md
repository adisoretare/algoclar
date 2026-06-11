# AlgoClar — Pagină de lecție · Spec de implementare

> Descriere fidelă a mockup-ului `AlgoClar Lesson Page.html` (+ `algoclar-lesson.css`, `lesson-data.js`, `lesson-app.js`) pentru developer.
> Culorile/spacing-urile trimit la `tokens/tokens.css` și `design/design-tokens.md`.
> Fonturi: **Sora** (heading), **IBM Plex Sans** (body/UI), **JetBrains Mono** (mono/cod/etichete).
> Exemplul implementat: lecția „Căutarea binară" (Clasa IX · Capitolul 5 · Căutări).

## 0. Layout global

- **Shell:** `.layout` = CSS grid `grid-template-columns: var(--sidebar-w) 1fr` (`--sidebar-w: 288px`). Clasa `.collapsed` → `0 1fr`.
- **Top bar** sticky deasupra (60px). **Sidebar** sticky sub el. **Main** = coloana de conținut.
- **Coloana de lectură `.content`:** `max-width: 780px`, centrată, `padding: 40px 40px 80px`. Asta ține rândul de text lizibil (~70 caractere).
- **Fundal:** `--background` `#FBFAF7`; cardurile/sidebar = `--surface` `#FFFFFF`.
- **Breakpoint-uri:** `1080px` (padding mai mic), `900px` (sidebar → drawer), `680px` (mobil), `420px` (celule viz mici).
- **Ritm secțiuni:** fiecare `<section.sec>` are `margin-top: 46px`; titlul intern `.lh` (Sora 700, 24px) cu număr mono `--accent` în față.

---

## 1. Top bar — `.topbar`

- Sticky, `z-index: 60`, `height: 60px`, fundal `rgba(251,250,247,.85)` + `blur(14px)`, linie jos `1px --border`.
- **Stânga:** buton **hamburger** (`.menu-btn`, vizibil doar ≤900px, deschide drawer-ul) · buton **collapse** (`#collapseBtn`, pliază sidebar-ul pe desktop) · logo AlgoClar.
- **Dreapta:** progres capitol — text mono „Capitol 47%" + bară `120×6px` (`--subtle` track, `--accent` fill).

---

## 2. Sidebar — `.sidebar` (pliabil / drawer)

- **Desktop:** sticky, `top: 60px`, `height: calc(100vh - 60px)`, `overflow-y: auto`, linie dreapta `1px --border`. Plierea = `translateX(-100%)` + grid-ul trece pe `0 1fr` (tranziție `.26s`).
- **Mobil (≤900px):** devine `position: fixed`, lățime `300px`, ascuns prin `translateX(-100%)`; clasa `.open` îl aduce în ecran cu `shadow-hover`. Apare **`.scrim`** (overlay `rgba(19,24,38,.42)` + blur) care la click închide drawer-ul. Click pe orice lecție → închide drawer-ul.
- **Header `.sb-head`** (sticky în interior): kicker mono „Clasa IX · Capitolul 5", titlu capitol (Sora 700, 18px), rând progres (bară `--success` + „3/7").
- **Listă `.sb-list`:** etichetă de secțiune mono uppercase, apoi itemi `.sb-item`:
  - Iconă status `22px` + titlu (`14px`) + număr lecție mono la dreapta (`--faint`).
  - **Status (icon + culoare):** `done` = cerc cu bifă `--success` · `prog` = cerc pe jumătate plin `--accent` · `todo` = cerc gol `--border-strong`.
  - Item **activ** = fundal `--accent-tint`, titlu `--accent` bold.
  - Hover (inactiv) = fundal `--subtle`.
- _Date:_ lista vine din `lesson-data.js → chapter[]` (`{n, title, status, active}`, plus `{section}` ca separator).

---

## 3. Antet lecție (breadcrumb + titlu + meta)

- **Breadcrumb `.crumb`:** mono `12.5px`, „Clasa IX › Căutări › **Căutarea binară**" — linkuri `--muted` (hover `--accent`), separator `›` `--faint`, ultimul segment `--strong`.
- **H1 `.lesson-h1`:** Sora 800, `clamp(30px, 4vw, 42px)`, `letter-spacing: -0.03em`. (Mobil 27px.)
- **Meta `.lesson-meta`:** „~14 min" (iconă ceas) · „7 pași" (iconă listă) · badge dificultate (`badge-mediu`). Iconuri `--faint`, text `--muted`.

---

## 4. LessonHook — `.hook` (caseta de intuiție)

**Primul lucru pe care-l citești — vizual distinct, prioritate maximă.**

- Fundal `linear-gradient(135deg, #F4F1FF, #EAF0FF)`, border `1px #DDD6FB`, `radius: 18px`, padding `26px 28px`. Bară verticală stângă `5px` cu gradient `violet → accent` (`::before`).
- **Eticheta `.hk`:** mono uppercase „Intuiția" + iconă steluță, culoare `--violet`.
- **Textul:** **Sora 500, 20px**, `line-height: 1.45` (nu body font — ca să se simtă ca o „voce" caldă). Cuvinte-cheie în `<em>` colorate `--accent`.

---

## 5. VisualizerShell — `.viz-shell` (ELEMENTUL DOMINANT)

Cardul cel mai mare al paginii: `--surface`, border `1px --border`, `radius: 20px`, `shadow: soft`.

### 5a. Bară titlu `.viz-bar`

3 puncte semafor (`--error/--warning/--success`), nume „vizualizare" mono `--faint`, tag „interactiv" la dreapta (mono `--accent` pe `--accent-tint`).

### 5b. Scena `.viz-stage` (padding `34px 30px 26px`)

- **Caption:** titlu „Căutare binară pas cu pas" (Sora 600, 18px) + dreapta „caută **71** · interval **[0, 8]**" (mono, valori dinamice în `--accent`).
- **Rând pointeri `.ptr`:** etichete `lo` (`--violet`) / `mid` (`--accent`) / `hi` (`--warning-ink`) aliniate pe lățimea celulei; se combină când coincid (`lo·mid`, `lo·hi`).
- **Vector `.vec`:** celule `58×66px`, `radius: 12px`, mono `19px`, index mic deasupra. Stări:
  - `.out` — în afara intervalului → `opacity: .32`.
  - `.range` — în interval → `--accent-tint` / text `--accent`.
  - `.mid` — mijlocul curent → `--accent` plin, alb, ridicat `-5px` + glow albastru.
  - `.found` — găsit → `--success` plin, alb, ridicat + glow verde.
  - Tranziție `.32s cubic-bezier(.4,0,.2,1)`.
- **Caseta explicație `.viz-explain`:** stil HintBox cu `border-left: 3px`. Text dinamic per pas, cu `<code>` inline. `min-height: 64px`. Variante: `.win` (verde, la găsire) / `.fail` (roșu, când valoarea nu există).
- **Bara de control `.viz-controls`:** Reset · Înapoi · **Play/Pause** (primar `46px`, `--accent`) · Înainte, separator, contor „pas N/3", apoi **slider viteză** `0.5×–3×` (la dreapta).

### 5c. „Încearcă cu datele tale" — `.tryzone`

Bandă separată jos (`border-top`, fundal `--background`).

- Titlu mono uppercase cu iconă.
- **Câmpuri:** input „Vector ordonat" (grow) + input mic „Caută" + buton primar „Rulează" + buton ghost „Aleatoriu". Inputuri mono, focus → border `--accent` + ring `rgba(45,107,255,.16)`.
- **Hint** sub câmpuri (`--faint`); devine roșu (`.err`) la input invalid.

### 5d. Logica vizualizării (`lesson-app.js`)

- **Parametrică pe `(arr, target)`** — `buildSteps()` generează pașii: stare inițială + câte un pas per comparație `mid`; dacă găsește → pas `found`; dacă intervalul se golește → pas `fail` (`-1`). Folosește `mij = lo + (hi-lo)/2` (anti-overflow, ca în cod).
- **Play** auto-avansează la `1500/speed` ms; oprire la final; re-Play repornește de la 0.
- **„Rulează":** parsează vectorul (split pe virgulă, filtrează NaN), **sortează automat crescător**, max 14 elemente, validează target; reconstruiește celulele și pașii. **„Aleatoriu":** generează 7–10 valori distincte sortate, target uneori absent (≈30%) ca să arate cazul „nu există".
- _Date config:_ `arr`, `target`, `speed`. Restul derivă — ușor de generalizat la altă vizualizare.

---

## 6. „Ideea" — `.sec.prose`

Titlu `.lh` „01 · Ideea". 3 paragrafe (IBM Plex 400, `16.5px`, `--body`), cu `<strong>` `--strong` și `<code>` pe `--subtle`.

## 7. CodeBlock C++ — `.codewrap`

- Header `.codebar` (fundal `--code-surface`): nume „cautare_binara.cpp" (mono `#8B97AE`) + buton **Copiază** (cu iconă; la succes → verde „Copiat" + bifă, revine după 1.7s).
- `<pre>` pe `--code-bg` `#0F1626`, mono `13.5px`, `line-height: 1.8`. Sintaxă colorată: comentarii `#5B6577`, keyword `#7A9CFF`, funcție `#9B86FF`, numere `#5ED1A0`.

## 8. Complexitate — `.cx-row`

Două carduri (grid 1fr 1fr → 1 col mobil): **Timp `O(log n)`** (iconă ceas, chip albastru) și **Spațiu `O(1)`** (iconă, chip violet). Fiecare: etichetă `--muted`, valoare mono 24px bold, notă `--faint`.

## 9. MistakeBox — `.cbox.box-mistake`

HintBox roșu discret: `border-left: 3px --error`, chip iconă triunghi pe `--error-tint`, titlu „Greșeli frecvente" `--error-ink`, listă cu 3 itemi (bulină roșie + `<code>` inline). Ton: semnalează, nu alarmează.

## 10. Probleme recomandate — `.prob-grid`

3 ProblemCard-uri compacte (grid 3 col → 1 col mobil): tag etapă (OJI `--accent` / ONI `--violet`), „an · cls. IX", titlu (Sora 600), apoi badge dificultate + badge-uri tehnică jos. Hover lift standard. _Date:_ `lesson-data.js → problems[]`.

## 11. Quiz — `.quiz` / `.qcard`

- 3 carduri întrebare. Antet: număr mono `--accent` + întrebare (Sora 600, 17px).
- **Opțiuni `.opt`:** rând cu marcaj circular `22px` + text; border `1.5px`, hover → border `--accent` + fundal `--accent-tint`.
- **La click (feedback imediat):** cardul devine `.answered` (opțiunile se blochează). Opțiunea corectă → verde (`--success`, bifă în marcaj); dacă ai greșit, alegerea ta → roșu (`--error`, X în marcaj). Apare caseta `.qfb`: verde „Corect. …" sau roșu „Nu chiar. …" cu **explicație de un rând**.
- _Date:_ `quiz[]` cu `{q, opts, correct, fb, fbWrong}`.

## 12. Recapitulare + navigare

- **`.recap`:** card gradient albastru→violet deschis, kicker „Reține", 3 buline (bifă `--accent` + text Sora-strong `16px`).
- **`.lnav`:** 2 carduri (grid 1fr 1fr → 1 col mobil): **Anterioara** (săgeată stânga, aliniat stânga) și **Următoarea** (`row-reverse`, aliniat dreapta). Fiecare: chip săgeată `--accent-tint`, „Anterioara/Următoarea" mono `--faint`, titlu lecție Sora 600. Hover lift.

---

## Note de implementare

- **Componente reutilizate** (badge dificultate/tehnică/status, ProblemCard, casetă tip Hint/Mistake, control bar): specificate în `design/design-tokens.md` §3.
- **Iconuri:** SVG inline `currentColor` (24×24, stroke 2). Lucide echivalent: panel-left, menu, clock, list, sparkles (hook), play/pause, skip-back/forward, rotate-ccw, copy, check, x, alert-triangle, arrow-left/right, box (spațiu).
- **Fișiere:** markup în `AlgoClar Lesson Page.html`; stil în `algoclar-lesson.css`; **datele** (lecții, probleme, quiz) în `lesson-data.js`; **logica** în `lesson-app.js`. Recomandare: componentizează pe secțiuni (Sidebar, VisualizerShell, Quiz, etc.) și ține datele într-un model separat ca aici.
- **Dark mode:** construit pe tokens light rezolvate; leagă variabilele din `.dark` (din `tokens.css`) — structura nu se schimbă.
- **De cablat:** rute reale (breadcrumb, lecții sidebar, prev/next, probleme), marcarea lecției „terminată" la final, persistarea progresului.
- **A11y:** `aria-pressed` pe Play, `aria-live="polite"` pe `.viz-explain`, rol/`aria-checked` pe opțiunile de quiz, focus vizibil (token `focusRing` în `tokens.json`), drawer cu focus trap + `Esc` to close.

_AlgoClar · Lesson page spec v1.0 · © 2026_
