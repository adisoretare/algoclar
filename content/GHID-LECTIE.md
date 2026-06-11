# Ghidul lecției AlgoClar — Șablonul de aur

Acest document codifică **exact** formatul unei lecții AlgoClar, extras din cele 5
lecții demo „de aur":

- `content/lessons/grade-5/introducere/ce-este-un-algoritm.mdx`
- `content/lessons/grade-6/vectori/parcurgerea-vectorilor.mdx`
- `content/lessons/grade-7/recursivitate/factorial.mdx`
- `content/lessons/grade-9/sortare/bubble-sort.mdx`
- `content/lessons/grade-9/cautare-binara/cautare-binara.mdx`

Orice lecție nouă trebuie să respecte acest șablon: aceeași structură, aceleași
componente MDX, același ton. Când ai un dubiu, deschide un demo și copiază tiparul.

> Slogan care ghidează tonul: **„Înțelegi algoritmica, nu o memorezi."**

---

## 1. Unde stă fișierul

Convenție de cale:

```
content/lessons/grade-{N}/{chapter}/{slug}.mdx
```

- `{N}` = numărul clasei din frontmatter (`5`–`12`). Pentru `11-12` folosim `11`;
  pentru `baraj-gimnaziu` folosim `8`.
- `{chapter}` = `id`-ul capitolului din `data/curriculum.ts`.
- `{slug}` = `id`-ul lecției din `data/curriculum.ts` (identic cu `slug` din frontmatter).

**Loaderul (`lib/content/lessons.ts`) citește `grade` și `chapter` din frontmatter,
NU din cale.** Folderul e doar pentru organizare umană — dar respectă convenția ca
să găsim fișierele ușor. `slug` trebuie să fie unic în tot proiectul (loaderul
caută lecția după slug).

---

## 2. Frontmatter

Ordinea câmpurilor (păstreaz-o identică pentru consistență):

```yaml
---
title: "Titlu lizibil, cu diacritice"
slug: slug-identic-cu-id-din-curriculum
grade: 9
chapter: vectori-9
difficulty: baza        # baza | mediu | greu
estimatedTime: 15       # minute, întreg
free: true
status: published       # draft | review | published
isBridge: false         # true doar la lecțiile-punte
tags: ["sortare", "comparație", "swap"]
visualizers: ["bubble-sort"]
relatedProblems: []
quiz:                   # OPȚIONAL, maxim 3 întrebări
  - question: "..."
    options: ["...", "...", "...", "..."]
    correctIndex: 1
    explanation: "..."
---
```

Schema autoritativă: `lib/content/types.ts` (`LessonFrontmatterSchema`, validată cu Zod).
Reguli:

| Câmp | Tip | Regulă |
|------|-----|--------|
| `title` | string | Lizibil, cu diacritice. Adesea „Subiect — sub-idee" (vezi demo-urile). |
| `slug` | string | = `id` din curriculum. Unic global. Fără diacritice, kebab-case. |
| `grade` | int 5–12 | Clasa. |
| `chapter` | string | = `id` capitol din curriculum. |
| `difficulty` | enum | `baza` \| `mediu` \| `greu`. |
| `estimatedTime` | int ≥1 | Minute de citit/parcurs. Demo-uri: 10–20. |
| `free` | bool | Implicit `true`. `false` doar pentru conținut premium. |
| `status` | enum | `draft` (scaffold), `review`, `published`. Lipsă ⇒ tratat ca `published`. |
| `isBridge` | bool | `true` la lecțiile-punte (capitolul le marchează `isBridge: true`). |
| `tags` | string[] | 2–4 etichete scurte, fără diacritice, kebab/lowercase. |
| `visualizers` | string[] | Nume de vizualizatoare (vezi `components/visualizers/registry.ts`). Gol dacă nu există. |
| `relatedProblems` | string[] | Slug-uri de probleme din arhivă. Gol până le legăm. |
| `quiz` | obiect[] | Opțional, max 3. Vezi §5. |

---

## 3. Componentele MDX disponibile

Definite în `components/mdx/index.ts` (`MDX_COMPONENTS`). NU inventa alte componente.

| Componentă | Rol | Folosire |
|-----------|-----|----------|
| `<LessonHook>` | Cârligul de deschidere — o analogie din viața reală. **Mereu primul element**, înainte de orice titlu. | `<LessonHook>...</LessonHook>` |
| `<ObservationBox>` | Observație importantă / intuiție / complexitate. | `<ObservationBox>...</ObservationBox>` |
| `<HintBox>` | Sfat practic, truc, cum folosești vizualizarea. | `<HintBox>...</HintBox>` |
| `<MistakeBox>` | Greșeala frecventă și cum o eviți. **Aproape mereu prezentă**, de regulă spre final. | `<MistakeBox>...</MistakeBox>` |
| `<Visualizer name="..." />` | Inserează vizualizarea interactivă. Auto-închisă. `name` = un slug din `visualizers`. | `<Visualizer name="bubble-sort" />` |

Markdown standard suportat: titluri `##`/`###`, liste, **bold**, *italic*, `cod inline`,
tabele GFM (`remark-gfm`), blocuri de cod cu evidențiere (`shiki`).

Reguli de stil pentru componente:
- `<LessonHook>` conține **doar** o analogie concretă, 2–4 propoziții. Fără cod, fără titlu.
- Casetele (`ObservationBox`/`HintBox`/`MistakeBox`) sunt scurte: 1–3 propoziții. Una singură per idee.
- Nu pune două casete consecutive de același tip. Alternează cu text explicativ.

---

## 4. Structura corpului (în ordine)

Tiparul comun celor 5 demo-uri. Nu toate sunt obligatorii, dar **ordinea** se respectă.

1. **`<LessonHook>`** — analogie din viața reală. *(obligatoriu, primul)*
2. **`## Ce este / Definiție`** — definiția clară a noțiunii, în cuvinte simple.
   - Adesea urmată de o listă cu proprietăți / pași.
   - Aici intră primul `<ObservationBox>` dacă există o intuiție-cheie.
3. **`## Algoritmul` (pas cu pas)** — explicație pe un exemplu concret cu numere.
   - Pseudocod în bloc ```` ``` ```` simplu SAU pași narativi numerotați.
   - Pentru lecții introductive: „De ce..." (de ce inițializăm așa, de ce ordinea contează).
4. **`## Implementare C++`** — cod complet, compilabil (vezi §6).
   - Opțional: o a doua variantă (optimizată / recursivă / iterativă) ca să compari.
5. **`## Complexitate`** — tabel `Caz | Timp | Spațiu` când e relevant.
6. **`<MistakeBox>`** — capcana clasică. *(aproape mereu)*
7. **`## Vizualizare`** + `<Visualizer name="..." />` — **doar dacă lecția are vizualizator**.
   - Adesea însoțit de un `<HintBox>` care explică controlul (← → / Redă).
8. **(opțional)** secțiune de încheiere: „în viața de zi cu zi", tabel de exemple, legături.

Lungime țintă: **150–250 de rânduri** de MDX (frontmatter inclus). Demo-urile au 95–115
rânduri pentru subiecte simple și pot crește pentru subiecte grele. Dacă depășești ~300,
probabil lecția ar trebui spartă în două.

### Lecțiile-punte (`isBridge: true`)

Fac legătura între capitole / consolidează o idee transversală (urmărire manuală,
overflow, alegerea tehnicii etc.). Aceeași structură, dar:
- accent pe **când / de ce** alegi ceva, nu pe un algoritm nou;
- de obicei fără `<Visualizer>`;
- `<MistakeBox>` și `<ObservationBox>` sunt inima lecției.

---

## 5. Quiz (opțional)

Maxim **3 întrebări**. Fiecare:
- `question` — clară, despre înțelegere, nu memorare.
- `options` — **2–4** variante (string-uri).
- `correctIndex` — index 0-based al răspunsului corect.
- `explanation` — de ce e corect / de ce contează. Mereu prezentă.

Ton: întrebările verifică intuiția (ex. „Cu ce inițializăm `max`?"), nu sintaxa pe de rost.

---

## 6. Reguli pentru cod

- Limbaj: **C++** (publicul țintă rezolvă OJI/ONI în C++).
- Cod **complet și compilabil** la prima apariție: `#include`, `using namespace std;`,
  `int main()`. Variantele alternative pot fi doar funcția, dacă `main` a fost deja arătat.
- Indentare 4 spații. `{` pe aceeași linie.
- Comentarii **scurte, în română, fără diacritice** în cod (ex. `// caz de baza`,
  `// evita overflow`). Diacriticele în comentarii de cod creează probleme de encoding.
- Preferă nume de variabile în română scurte și clare: `maxim`, `suma`, `st`, `dr`, `mid`.
- Arată numere concrete în exemple (`{5, 3, 8, 1, 9, 2}`) și rezultatul așteptat în comentariu (`// 120`).
- Evidențiază capcanele reale de concurs: overflow (`long long`, `st + (dr-st)/2`),
  inițializări greșite, limite de timp (O(n²) pentru n mare).

---

## 7. Ton și limbă

- **Română**, cu diacritice, în tot textul (NU în comentariile din cod).
- Persoana a II-a, prietenos dar precis: „Ai o listă...", „Testează cu...".
- Pornește mereu de la **concret → abstract**: analogie, apoi definiție, apoi formalizare.
- Explică **de ce**, nu doar **cum**. Fiecare alegere are o justificație.
- Fără umplutură. Fragmente clare > paragrafe lungi.

---

## 8. Checklist înainte de `status: published`

- [ ] Frontmatter complet, ordine respectată, validează la schema Zod.
- [ ] `slug` = `id` din `curriculum.ts`, unic global.
- [ ] `<LessonHook>` primul, cu analogie concretă.
- [ ] Cel puțin un `<ObservationBox>` și un `<MistakeBox>`.
- [ ] Cod C++ complet, compilabil, indentat la 4 spații, comentarii fără diacritice.
- [ ] Secțiune `## Complexitate` dacă e relevant.
- [ ] `<Visualizer>` prezent **dacă și numai dacă** există vizualizator în `visualizers`.
- [ ] Nume vizualizator există în `components/visualizers/registry.ts`.
- [ ] Lungime rezonabilă (~150–250 rânduri).
- [ ] Diacritice corecte în text; ton prietenos, „de ce" explicat.

---

## 9. Generare schelete (scaffold)

Nu scrie frontmatter-ul de mână pentru capitole întregi. Folosește:

```bash
pnpm scaffold <gradeId> <chapterId>
# ex:
pnpm scaffold 5 vectori
pnpm scaffold 11-12 grafuri-notiuni
pnpm scaffold baraj-gimnaziu baraj
```

Generează scheletele MDX goale (`status: draft`) pentru toate lecțiile capitolului,
cu frontmatter precompletat din `data/curriculum.ts` (title, slug, grade, chapter,
isBridge, visualizers). Nu suprascrie fișiere existente. Vezi `tools/scaffold-lessons.ts`.

După scaffold: completezi corpul fiecărei lecții conform acestui ghid și treci
`status` la `published`.
