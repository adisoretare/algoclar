# AlgoClar — Homepage · Spec de implementare

> Descriere fidelă a mockup-ului `AlgoClar Homepage.html` pentru developer.
> Toate culorile/spacing-urile trimit la `tokens/tokens.css` și `design/design-tokens.md`.
> Fonturi: **Sora** (heading), **IBM Plex Sans** (body/UI), **JetBrains Mono** (mono/cod/etichete).

## 0. Layout global
- **Container:** `.wrap` → `max-width: 1200px`, centrat, `padding: 0 32px` (mobil `0 20px`).
- **Fundal pagină:** `--background` `#FBFAF7`. Benzile „alternate" (`.band.alt`) folosesc `--card` `#FFFFFF` cu linie sus/jos `1px --border`.
- **Ritm vertical secțiuni:** `padding: 80px 0` desktop · `56px 0` sub 680px.
- **Umbre:** `card` (subtilă, repaus) · `soft` (panou hero) · `hover` (ridicare la hover). Valorile exacte sunt în tokens.
- **Breakpoint-uri:** `980px` (tabletă), `680px` (mobil), `380px` (mobil mic).

---

## 1. Navbar — `.nav`
- **Comportament:** `position: sticky; top: 0; z-index: 50`. Fundal `rgba(251,250,247,.82)` + `backdrop-filter: blur(14px)`, linie jos `1px --border`. Înălțime `66px`.
- **Stânga:** logo = `.mark` (3 trepte: `#9FB6FF` / `--accent` / `--violet`, înălțimi 11/18/26px) + wordmark „Algo**Clar**" (Sora 800, „Clar" în `--accent`).
- **Centru:** linkuri `Cum înveți · Clase · Arhivă OJI/ONI · Premium` — IBM Plex 500, `14.5px`, `--muted`, hover → `--strong`.
- **Dreapta:** link text „Intră în cont" + buton primar mic „Începe gratuit".
- **Mobil (≤680px):** linkurile și „Intră în cont" dispar; apare butonul **burger** (icon hamburger). *Notă dev:* meniul mobil în sine nu e implementat în mockup — de cablat un drawer.

---

## 2. Hero — `.hero` (grid 2 coloane)
- **Grid:** `grid-template-columns: 1.05fr 1fr; gap: 56px; align-items: center`. Padding `72px 0 64px`. Sub 980px → o coloană, viz-ul trece **sub** copy.

### 2a. Coloana stângă (copy)
- **Eyebrow pill:** „● Pentru clasele V–XII" — mono `12.5px`, text+punct `--accent`, fundal `--accent-tint`, `radius: pill`, padding `6px 13px`.
- **Titlu H1:** „Algoritmica explicată *clar*." — Sora 800, `clamp(40px, 5vw, 60px)`, `line-height: 1.02`, `letter-spacing: -0.035em`. Cuvântul „clar" în `--accent`. Break forțat înainte de „explicată". (Mobil: `34px`.)
- **Lede:** subtitlul, IBM Plex 400, `19px`, `--muted`, `max-width: 520px`, `margin-top: 22px`.
- **CTA row** (`margin-top: 34px`, `gap: 13px`):
  - Primar `btn-primary btn-lg`: „Începe să înveți" + iconă săgeată. `--accent`, text alb, `radius: 10px`, padding `15px 26px`.
  - Secundar `btn-secondary btn-lg`: „Vezi arhiva OJI/ONI". Fundal `--accent-tint`, text `--accent`.
  - Mobil: full-width, stivuite.
- **Trust row** (`margin-top: 34px`): 3 itemi cu bifă `--success` — „Bazele, gratuit · 520+ probleme explicate · Arhivă 2021–2026", separați prin linii verticale `1px --border`. Text `14px --muted`.

### 2b. Coloana dreaptă — panoul de vizualizare `.viz-panel` (INTERACTIV)
Card `--surface`, `border 1px --border`, `radius: 20px`, `shadow: soft`, `overflow: hidden`.

- **Header `.viz-head`:** 3 puncte semafor (roșu/galben/verde = `--error/--warning/--success`), nume fișier mono `cautare_binara.viz` (`--faint`), tag „interactiv" la dreapta (mono, `--accent` pe `--accent-tint`). Linie jos `1px --border`, fundal `--background`.
- **Body `.viz-body`** (padding `26px 24px 22px`):
  - **Caption:** titlu „Căutare binară" (Sora 600, 16px) + dreapta „caută **71** · O(log n)" (mono, valoarea în `--accent`).
  - **Rând pointeri `.ptr`:** etichete `lo` (`--violet`) · `mid` (`--accent`) · `hi` (`--warning-ink`), aliniate deasupra celulei corespunzătoare. Se combină când coincid (ex. `lo·hi`).
  - **Vector `.vec`:** 9 celule (`[4,8,15,16,23,42,55,71,88]`). Fiecare celulă `46×54px`, `radius: 10px`, mono `16px`, cu index mic deasupra (`--faint`). Stări de celulă:
    - `.out` — în afara intervalului → `opacity: .34`.
    - `.range` — în intervalul activ → fundal `--accent-tint`, text `--accent`.
    - `.mid` — elementul mijloc curent → fundal `--accent` plin, text alb, `translateY(-4px)` + glow albastru.
    - `.found` — elementul găsit → fundal `--success` plin, text alb, ridicat + glow verde.
    - Tranziție pe toate: `.3s cubic-bezier(.4,0,.2,1)`.
  - **Caseta explicație `.viz-explain`:** stil HintBox — `border-left: 3px --accent`, fundal `--background`, `radius: 10px`. Text dinamic per pas, cu `<code>` inline pe fundal `--subtle`. `min-height: 62px` (nu sare layout-ul).
  - **Bara de control `.viz-controls`:** Reset · Prev · **Play/Pause** (primar) · Next + contor „pas N/3" la dreapta.
    - Butoane normale `38×38px`, `radius: 9px`, transparent, hover → fundal `--subtle`.
    - Play primar `44×44px`, `radius: 11px`, `--accent`, icon alb; comută icon Play↔Pause.
    - Prev/Next se dezactivează (`opacity .4`) la capete.

#### Logica vizualizării (pre-calculată în JS)
- Pașii sunt generați din `buildSteps(arr, target)`: pas 0 = stare inițială (tot vectorul `range`), apoi câte un pas per comparație `mid`. Pentru target `71`: 3 comparații → găsit la index 7. Contorul total = `STEPS.length - 1`.
- **Play:** avansează automat la `1400ms`/pas; la final se oprește; dacă apeși Play după final, repornește de la 0.
- **Next/Prev/Reset:** opresc auto-play-ul și navighează manual.
- Mesajele explică *de ce* se înjumătățește intervalul (ex. „`v[4] = 23 < 71` → ignorăm stânga"), nu doar *ce* se întâmplă.
- *Dev:* `arr`, `target` și viteza sunt singurele variabile de config; restul derivă. Ușor de generalizat la alte vizualizări.

---

## 3. „Cum înveți pe AlgoClar" — `.band.alt #cum`
- **Header secțiune centrat** (`max-width: 680px`): kicker mono `--accent` uppercase „Cum înveți pe AlgoClar", H2 „De la idee la problemă rezolvată" (Sora 700, `clamp(28px,3.4vw,40px)`), paragraf `--muted`.
- **Grid 4 carduri** (`repeat(4,1fr)`, `gap: 18px`) → 2 col la 980px, 1 col la 680px.
- **Card `.step`:** `--surface`, `border 1px --border`, `radius: 16px`, padding `26px 22px`. Conține: număr mono (`01`–`04`), iconă într-un chip `46×46px radius 12px`, titlu (Sora 600, 18px), paragraf (`14.5px --muted`).
  - Culori chip per pas: 1 = albastru (`--accent-tint`/`--accent`), 2 = violet, 3 = verde, 4 = galben.
  - Între carduri (desktop): **săgeată** de flux suprapusă la dreapta (`--border-strong`); ascunsă pe mobil.
  - Hover: `translateY(-4px)` + `shadow: hover` + border `--accent`.
- Conținut: **Vezi ideea · O testezi interactiv · Înțelegi algoritmul · Rezolvi probleme reale.**

---

## 4. „Alege clasa ta" — `.band #clase`
- Header centrat (kicker „Alege clasa ta", H2 „Un traseu pentru fiecare an").
- **Grid `.grades`:** `repeat(4,1fr)`, `gap: 16px` → 3 col la 980px, 2 col la 680px, 1 col la 380px.
- **Card `.grade`** (`min-height: 150px`, padding `22px`, `radius: 16px`): cifra romană mare (Sora 800, 34px), descriere `--muted`, jos un rând meta mono (`--faint`) + chevron `--accent` care apare/glisează la hover.
- **7 carduri:** V, VI, VII, VIII, IX, X, **XI–XII**.
- Ultimul card (`XI–XII`, `.feat`) = **gradient `150deg, #2D6BFF → #7A5AF8`**, tot textul alb — accent vizual pentru nivelul de performanță/baraj.
- Hover (carduri normale): `translateY(-4px)` + `shadow: hover` + border `--accent`.

---

## 5. Arhivă OJI/ONI — `.band.alt #arhiva`
- **Antet `.arch-top`:** header secțiune **aliniat stânga** (kicker + H2 „Probleme de concurs, explicate" + paragraf) și, la dreapta, buton ghost „Filtrează" cu iconă. Pe mobil se stivuiesc.
- **Grid `.problem-grid`:** `repeat(2,1fr)`, `gap: 16px` → 1 col pe mobil.
- **ProblemCard** (identic cu component sheet): 
  - Sus: tag etapă (`OJI` = `--accent`, `ONI` = `--violet`, mono 700 alb), „an · clasa a X-a" (mono `--muted`), badge dificultate la dreapta.
  - Titlu (Sora 600, 18px). Rând badge-uri **tehnică** (outline neutru).
  - Footer cu separator sus: status pill („explicată" verde+bifă / „linkuită" albastru+link) + săgeată la dreapta.
  - Hover: border `--accent` + `shadow: hover` + `translateY(-3px)`.
- **4 exemple:** Trenuri (OJI 2024 X, greu, DP+grafuri) · Cifre ascunse (ONI 2023 XI, baraj, greedy+hashing) · Cutii (OJI 2022 VIII, mediu, sortare+two-pointers) · Poteci (ONI 2025 XII, baraj, grafuri+DP).
- **Footer secțiune:** buton primar centrat „Vezi toată arhiva 2021–2026" + săgeată.

---

## 6. Bandă Premium — `.band #premium > .premium`
- Bloc întunecat: fundal `--code-bg` `#0F1626`, `radius: 24px`, padding `56px`. Peste el, două glow-uri radiale (violet sus-dreapta, albastru jos-stânga) prin `::before`.
- **Layout `.premium-in`:** flex space-between, wrap. Stânga = text, dreapta = CTA.
  - Stânga: kicker mono `#9FB6FF` „AlgoClar Premium"; H2 alb „Învață gratuit bazele. Deblochează *arhiva completă* explicată." („arhiva completă" în `#9FB6FF`); paragraf `rgba(255,255,255,.7)`.
  - Dreapta: buton alb (`btn-white`, text `--strong`) „Deblochează Premium" + sub el rând cu bifă verde „Bazele rămân gratuite, pentru totdeauna".
- Mobil: coloană unică, CTA full-width, padding `40px 26px`, `radius: 18px`.

---

## 7. Footer — `footer.foot`
- Fundal `--surface`, linie sus `1px --border`, padding `56px 0 36px`.
- **Grid `.foot-grid`:** `1.6fr 1fr 1fr 1fr` → 2 col la 980px, 1 col la 680px.
  - Col 1: logo + tagline scurt.
  - Col 2–4: „Învață / Arhivă / AlgoClar" — titlu uppercase `--faint`, linkuri `--body` hover `--accent`.
- **Rând jos `.foot-bot`** (separator sus): „© 2026 AlgoClar · Făcut în România" (mono `--faint`) + 3 iconuri sociale (GitHub, YouTube, Discord) în pătrate `34px` cu border, hover → `--accent`.

---

## Note de implementare
- **Componentele reutilizabile** (buton, badge dificultate/tehnică/status, ProblemCard, casetă tip Hint) sunt deja specificate în `design/design-tokens.md` §3 — homepage-ul doar le instanțiază.
- **Iconuri:** SVG inline `stroke`/`fill currentColor` (24×24, stroke 2). Înlocuibile cu Lucide echivalent (eye, play, lightbulb, graduation-cap, search, filter, arrow-right, check, link, rotate-ccw, skip-forward/back, pause).
- **Dark mode:** pagina e construită pe tokens light rezolvate. Pentru dark, leagă variabilele din `.dark` (din `tokens.css`) — structura nu se schimbă.
- **De cablat la backend/rute:** toate `href="#"`, butoanele CTA, meniul burger mobil, filtrul de arhivă.
- **A11y:** de adăugat `aria-pressed` pe Play, `aria-live="polite"` pe `.viz-explain`, focus states vizibile (token `focusRing` există în tokens.json).

*AlgoClar · Homepage spec v1.0 · © 2026*
