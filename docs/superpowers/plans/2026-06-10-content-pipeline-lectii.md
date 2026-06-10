# Lesson Content Pipeline — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** MDX content pipeline: frontmatter validation (Zod), file loaders with build cache, custom MDX components (CodeBlock+shiki, LessonHook, Visualizer placeholder), V–XII curriculum data, 2 demo lessons, Vitest tests.

**MDX choice (3 lines):** `next-mdx-remote/rsc` chosen over `@next/mdx` because lesson files live in `content/lessons/grade-<n>/<chapter>/<slug>.mdx` outside `app/` — `@next/mdx` only processes `.mdx` files that are Next.js route segments. `next-mdx-remote` compiles MDX in Server Components via `compileMDX`, accepts a custom components map, and needs zero webpack config. `gray-matter` strips frontmatter separately so the loaders can return metadata without compiling the full MDX.

**Architecture:** Loaders in `lib/content/lessons.ts` use `gray-matter` to parse frontmatter and `zod` to validate it; a module-level cache ensures each file is read once per build. `shiki` runs as a singleton in `lib/highlighter.ts`; only `CopyButton` is `"use client"`. Lesson page routes (Task 8+) call `compileMDX` with the components map from `components/mdx/index.ts`.

**Tech Stack:** next-mdx-remote v5, gray-matter, zod, shiki v1, vitest

---

## File Map

```
content/lessons/
  grade-9/sortare/bubble-sort.mdx          — Demo lesson 1
  grade-7/recursivitate/factorial.mdx       — Demo lesson 2

lib/content/
  types.ts          — LessonFrontmatterSchema (zod) + LessonMeta + LessonWithContent types
  lessons.ts        — getAllLessons(), getLessonBySlug(), getLessonsByGrade(), getChaptersByGrade()

lib/
  highlighter.ts    — shiki singleton via createHighlighter

data/
  curriculum.ts     — CURRICULUM: GradeData[] grades 5–12 with chapters

components/mdx/
  CopyButton.tsx    — "use client", clipboard API
  CodeBlock.tsx     — async RSC: shiki highlight + CopyButton
  LessonHook.tsx    — opening hook callout (styled distinct from HintBox)
  Visualizer.tsx    — placeholder: renders name in dashed border
  index.ts          — MDX_COMPONENTS map for compileMDX

__tests__/content/
  lessons.test.ts   — vitest: schema unit tests + loader integration tests

next.config.ts      — add serverExternalPackages: ['shiki']
vitest.config.ts    — vitest node config with @/* alias
package.json        — add "test": "vitest run" script
```

---

### Task 1: Install Deps + Tooling Config

**Files:**
- Modify: `package.json` (add test script)
- Modify: `next.config.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install runtime deps**

```powershell
pnpm add next-mdx-remote gray-matter zod shiki
```

- [ ] **Step 2: Install dev deps**

```powershell
pnpm add -D vitest @vitest/node
```

- [ ] **Step 3: Add test script to package.json**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), '.'),
    },
  },
})
```

- [ ] **Step 5: Update next.config.ts**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['shiki'],
}

export default nextConfig
```

- [ ] **Step 6: Verify install**

```powershell
pnpm tsc --noEmit
```

Expected: 0 errors (only our existing files, no new code yet).

---

### Task 2: lib/content/types.ts — Zod Schema + Types

**Files:**
- Create: `lib/content/types.ts`
- Create: `__tests__/content/lessons.test.ts` (schema tests only at this stage)

- [ ] **Step 1: Write failing schema tests**

Create `__tests__/content/lessons.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { LessonFrontmatterSchema } from '@/lib/content/types'

describe('LessonFrontmatterSchema', () => {
  const valid = {
    title: 'Bubble Sort',
    slug: 'bubble-sort',
    grade: 9,
    chapter: 'sortare',
    difficulty: 'baza' as const,
    estimatedTime: 15,
  }

  it('accepts valid frontmatter', () => {
    const result = LessonFrontmatterSchema.parse(valid)
    expect(result.title).toBe('Bubble Sort')
    expect(result.free).toBe(true)
    expect(result.tags).toEqual([])
    expect(result.visualizers).toEqual([])
    expect(result.relatedProblems).toEqual([])
  })

  it('defaults free to true when omitted', () => {
    const result = LessonFrontmatterSchema.parse(valid)
    expect(result.free).toBe(true)
  })

  it('accepts free: false explicitly', () => {
    const result = LessonFrontmatterSchema.parse({ ...valid, free: false })
    expect(result.free).toBe(false)
  })

  it('throws on missing required title', () => {
    const { title: _, ...rest } = valid
    expect(() => LessonFrontmatterSchema.parse(rest)).toThrow()
  })

  it('throws on invalid difficulty', () => {
    expect(() =>
      LessonFrontmatterSchema.parse({ ...valid, difficulty: 'ușor' }),
    ).toThrow()
  })

  it('throws on grade outside 5-12', () => {
    expect(() =>
      LessonFrontmatterSchema.parse({ ...valid, grade: 4 }),
    ).toThrow()
    expect(() =>
      LessonFrontmatterSchema.parse({ ...valid, grade: 13 }),
    ).toThrow()
  })

  it('throws on negative estimatedTime', () => {
    expect(() =>
      LessonFrontmatterSchema.parse({ ...valid, estimatedTime: -1 }),
    ).toThrow()
  })

  it('accepts tags, visualizers, relatedProblems arrays', () => {
    const result = LessonFrontmatterSchema.parse({
      ...valid,
      tags: ['sortare', 'comparatie'],
      visualizers: ['bubble-sort'],
      relatedProblems: ['oji-2023-9-sortare'],
    })
    expect(result.tags).toEqual(['sortare', 'comparatie'])
  })
})
```

- [ ] **Step 2: Run test — verify it FAILS**

```powershell
pnpm test
```

Expected failure: `Cannot find module '@/lib/content/types'`

- [ ] **Step 3: Create lib/content/types.ts**

```typescript
import { z } from 'zod'

export const LessonFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  grade: z.number().int().min(5).max(12),
  chapter: z.string().min(1),
  difficulty: z.enum(['baza', 'mediu', 'greu']),
  estimatedTime: z.number().int().min(1),
  free: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  visualizers: z.array(z.string()).default([]),
  relatedProblems: z.array(z.string()).default([]),
})

export type LessonFrontmatter = z.infer<typeof LessonFrontmatterSchema>

export interface LessonMeta extends LessonFrontmatter {
  filePath: string
}

export interface LessonWithContent extends LessonMeta {
  rawContent: string
}
```

- [ ] **Step 4: Run test — verify it PASSES**

```powershell
pnpm test
```

Expected: `8 tests passed`

- [ ] **Step 5: Commit**

```bash
git add lib/content/types.ts __tests__/content/lessons.test.ts
git commit -m "feat: LessonFrontmatter zod schema + types"
```

---

### Task 3: data/curriculum.ts — V–XII Curriculum

**Files:**
- Create: `data/curriculum.ts`

> **Note:** The user's original document Section 7 was not pasted. This curriculum is a best-faith reconstruction based on Romanian CS education standards. Update the `chapters` arrays per the official curriculum document before launch.

- [ ] **Step 1: Create data/curriculum.ts**

```typescript
export interface Chapter {
  id: string
  title: string
  order: number
}

export interface GradeData {
  grade: 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  label: string
  chapters: Chapter[]
}

export const CURRICULUM: GradeData[] = [
  {
    grade: 5,
    label: 'Clasa a V-a',
    chapters: [
      { id: 'introducere', title: 'Introducere în algoritmică', order: 1 },
      { id: 'variabile', title: 'Variabile și tipuri de date', order: 2 },
      { id: 'conditii', title: 'Instrucțiuni condiționale', order: 3 },
      { id: 'cicluri', title: 'Cicluri repetitive', order: 4 },
    ],
  },
  {
    grade: 6,
    label: 'Clasa a VI-a',
    chapters: [
      { id: 'tablouri', title: 'Tablouri unidimensionale', order: 1 },
      { id: 'siruri', title: 'Șiruri de caractere', order: 2 },
      { id: 'functii', title: 'Funcții și subprograme', order: 3 },
      { id: 'matrice', title: 'Matrice', order: 4 },
    ],
  },
  {
    grade: 7,
    label: 'Clasa a VII-a',
    chapters: [
      { id: 'recursivitate', title: 'Recursivitate', order: 1 },
      { id: 'divide-et-impera', title: 'Divide et Impera', order: 2 },
      { id: 'sortare', title: 'Algoritmi de sortare', order: 3 },
      { id: 'complexitate', title: 'Complexitate algoritmică', order: 4 },
    ],
  },
  {
    grade: 8,
    label: 'Clasa a VIII-a',
    chapters: [
      { id: 'stive-cozi', title: 'Stive și cozi', order: 1 },
      { id: 'liste', title: 'Liste înlănțuite', order: 2 },
      { id: 'greedy', title: 'Algoritmi Greedy', order: 3 },
      { id: 'oji-8', title: 'Pregătire OJI — clasa 8', order: 4 },
    ],
  },
  {
    grade: 9,
    label: 'Clasa a IX-a',
    chapters: [
      { id: 'sortare', title: 'Sortare avansată', order: 1 },
      { id: 'cautare-binara', title: 'Căutare binară', order: 2 },
      { id: 'greedy', title: 'Algoritmi Greedy', order: 3 },
      { id: 'backtracking', title: 'Backtracking', order: 4 },
    ],
  },
  {
    grade: 10,
    label: 'Clasa a X-a',
    chapters: [
      { id: 'grafuri', title: 'Introducere în grafuri', order: 1 },
      { id: 'bfs-dfs', title: 'BFS și DFS', order: 2 },
      { id: 'arbori', title: 'Arbori', order: 3 },
      { id: 'drumuri-minime', title: 'Drumuri minime', order: 4 },
    ],
  },
  {
    grade: 11,
    label: 'Clasa a XI-a',
    chapters: [
      { id: 'programare-dinamica', title: 'Programare dinamică', order: 1 },
      { id: 'fluxuri', title: 'Fluxuri în rețele', order: 2 },
      { id: 'geometrie', title: 'Geometrie computațională', order: 3 },
      { id: 'tehnici-avansate', title: 'Tehnici avansate', order: 4 },
    ],
  },
  {
    grade: 12,
    label: 'Clasa a XII-a',
    chapters: [
      { id: 'algoritmi-avansati', title: 'Algoritmi avansați', order: 1 },
      { id: 'structuri-date', title: 'Structuri de date avansate', order: 2 },
      { id: 'oni-pregatire', title: 'Pregătire ONI', order: 3 },
    ],
  },
]

export function getGradeData(grade: number): GradeData | undefined {
  return CURRICULUM.find((g) => g.grade === grade)
}

export function getChapterTitle(grade: number, chapterId: string): string {
  const gradeData = getGradeData(grade)
  return gradeData?.chapters.find((c) => c.id === chapterId)?.title ?? chapterId
}
```

- [ ] **Step 2: Type check**

```powershell
pnpm tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add data/curriculum.ts
git commit -m "feat: V-XII curriculum structure"
```

---

### Task 4: Demo MDX Lesson Files

> Created before loader tests so integration tests have real files to read.

**Files:**
- Create: `content/lessons/grade-9/sortare/bubble-sort.mdx`
- Create: `content/lessons/grade-7/recursivitate/factorial.mdx`

- [ ] **Step 1: Create content/lessons/grade-9/sortare/bubble-sort.mdx**

```mdx
---
title: "Bubble Sort — cum și de ce"
slug: bubble-sort
grade: 9
chapter: sortare
difficulty: baza
estimatedTime: 15
free: true
tags: ["sortare", "comparație", "swap"]
visualizers: ["bubble-sort"]
relatedProblems: []
---

<LessonHook>
Ai o grămadă de fișe dezordonate pe birou. Cel mai simplu mod de a le sorta?
Treci de mai multe ori prin ele și schimbi oricare două fișe vecine care sunt în
ordine greșită. Exact asta face Bubble Sort.
</LessonHook>

## Ce este Bubble Sort?

Bubble Sort este cel mai simplu algoritm de sortare prin comparație. La fiecare
**trecere** prin șir, elementele mai mari "plutesc" (bubble) spre dreapta, la
fel cum bulele de aer urcă în apă.

## Algoritmul pas cu pas

Fie șirul `[5, 3, 8, 1, 9, 2]`. O trecere completă arată așa:

- Comparăm 5 și 3 → swap → `[3, 5, 8, 1, 9, 2]`
- Comparăm 5 și 8 → ok
- Comparăm 8 și 1 → swap → `[3, 5, 1, 8, 9, 2]`
- Comparăm 8 și 9 → ok
- Comparăm 9 și 2 → swap → `[3, 5, 1, 8, 2, 9]`

După prima trecere, `9` (maximul) este pe poziția corectă. Repetăm pentru `n-1` treceri.

<ObservationBox>
După trecerea `k`, ultimele `k` elemente sunt deja sortate și nu mai trebuie
comparate. Optimizat, facem `n-1 + n-2 + ... + 1 = n(n-1)/2` comparații.
</ObservationBox>

## Implementare C++

<CodeBlock language="cpp">{`#include <iostream>
using namespace std;

void bubbleSort(int a[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - 1 - i; j++) {
            if (a[j] > a[j + 1]) {
                swap(a[j], a[j + 1]);
            }
        }
    }
}

int main() {
    int a[] = {5, 3, 8, 1, 9, 2};
    int n = 6;
    bubbleSort(a, n);
    for (int i = 0; i < n; i++) {
        cout << a[i] << " ";
    }
    return 0;
}`}</CodeBlock>

## Versiunea optimizată

Dacă o trecere nu produce niciun swap, șirul e deja sortat. Ieșim devreme:

<CodeBlock language="cpp">{`void bubbleSortOpt(int a[], int n) {
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - 1 - i; j++) {
            if (a[j] > a[j + 1]) {
                swap(a[j], a[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}`}</CodeBlock>

<HintBox>
Pe un șir deja sortat, versiunea optimizată face doar **O(n)** comparații
(o singură trecere fără niciun swap). Fără optimizare: mereu O(n²).
</HintBox>

## Complexitate

| Caz | Timp | Spațiu |
|-----|------|--------|
| Cel mai bun (șir sortat, cu opt.) | O(n) | O(1) |
| Mediu | O(n²) | O(1) |
| Cel mai rău | O(n²) | O(1) |

<MistakeBox>
Nu folosi Bubble Sort pentru n > 10.000 în concursuri — O(n²) e prea lent.
Pentru n mare folosește `std::sort` (O(n log n)) sau Merge Sort.
</MistakeBox>

## Vizualizare

<Visualizer name="bubble-sort" />
```

- [ ] **Step 2: Create content/lessons/grade-7/recursivitate/factorial.mdx**

```mdx
---
title: "Factorial — prima ta recursivitate"
slug: factorial
grade: 7
chapter: recursivitate
difficulty: baza
estimatedTime: 12
free: true
tags: ["recursivitate", "functii", "factorial"]
visualizers: []
relatedProblems: []
---

<LessonHook>
Cât face 5!? Dacă știi că 4! = 24, atunci 5! = 5 × 24 = 120. Asta e recursivitatea:
rezolvi o problemă mare folosind soluția uneia mai mici.
</LessonHook>

## Ce este recursivitatea?

O funcție este **recursivă** când se apelează pe ea însăși cu un argument mai mic.
Orice recursivitate are două părți obligatorii:

1. **Cazul de bază** — condiția de oprire (fără ea, funcția rulează la infinit)
2. **Pasul recursiv** — problema se reduce la o versiune mai mică

## Factorialul

Definiția matematică:

```
n! = n × (n-1) × ... × 2 × 1
0! = 1 (prin convenție)
```

Rescrisă recursiv: `n! = n × (n-1)!`

<ObservationBox>
Cazul de bază este `0! = 1`. Fără el, funcția ar apela `(-1)!`, `(-2)!`, ...
până la stack overflow.
</ObservationBox>

## Implementare recursivă C++

<CodeBlock language="cpp">{`#include <iostream>
using namespace std;

long long factorial(int n) {
    if (n == 0) return 1;      // caz de baza
    return n * factorial(n - 1); // pas recursiv
}

int main() {
    cout << factorial(5) << endl;  // 120
    cout << factorial(10) << endl; // 3628800
    return 0;
}`}</CodeBlock>

## Stiva de apeluri

Când apelăm `factorial(4)`, calculatorul face:

```
factorial(4)
  → 4 * factorial(3)
        → 3 * factorial(2)
              → 2 * factorial(1)
                    → 1 * factorial(0)
                          → 1   (caz de baza)
```

Răspunsurile se întorc în ordine inversă: `1 → 1 → 2 → 6 → 24`.

<HintBox>
Vizualizează recursivitatea ca o stivă de scrisori: pui câte una pe stivă
(apeluri recursive), iar când ajungi la bază le deschizi de sus în jos (returnuri).
</HintBox>

## Implementare iterativă (comparație)

<CodeBlock language="cpp">{`long long factorialIterativ(int n) {
    long long rezultat = 1;
    for (int i = 2; i <= n; i++) {
        rezultat *= i;
    }
    return rezultat;
}`}</CodeBlock>

<MistakeBox>
`int` depășește la 13! (2.147.483.647 < 6.227.020.800). Folosește `long long`
pentru n ≥ 13. La n ≥ 21, nici `long long` nu ajunge — folosește big integer
sau lucrul modulo un număr prim.
</MistakeBox>
```

- [ ] **Step 3: Commit**

```bash
git add content/
git commit -m "feat: 2 lectii demo MDX (bubble-sort, factorial)"
```

---

### Task 5: lib/content/lessons.ts — File Loaders

**Files:**
- Create: `lib/content/lessons.ts`
- Modify: `__tests__/content/lessons.test.ts` (add loader integration tests)

- [ ] **Step 1: Add loader tests to __tests__/content/lessons.test.ts**

Append to the existing test file:

```typescript
import { describe, it, expect, beforeAll } from 'vitest'
import {
  getAllLessons,
  getLessonBySlug,
  getLessonsByGrade,
  getChaptersByGrade,
} from '@/lib/content/lessons'
import type { LessonMeta } from '@/lib/content/types'

describe('getAllLessons()', () => {
  let lessons: LessonMeta[]

  beforeAll(async () => {
    lessons = await getAllLessons()
  })

  it('returns at least 2 lessons', async () => {
    expect(lessons.length).toBeGreaterThanOrEqual(2)
  })

  it('each lesson has valid frontmatter shape', () => {
    for (const lesson of lessons) {
      expect(lesson.title).toBeTruthy()
      expect(lesson.slug).toBeTruthy()
      expect(lesson.grade).toBeGreaterThanOrEqual(5)
      expect(lesson.grade).toBeLessThanOrEqual(12)
      expect(['baza', 'mediu', 'greu']).toContain(lesson.difficulty)
      expect(Array.isArray(lesson.tags)).toBe(true)
    }
  })

  it('returns same array on second call (cache hit)', async () => {
    const second = await getAllLessons()
    expect(second).toBe(lessons)
  })
})

describe('getLessonBySlug()', () => {
  it('returns bubble-sort lesson with rawContent', async () => {
    const lesson = await getLessonBySlug('bubble-sort')
    expect(lesson).not.toBeNull()
    expect(lesson!.slug).toBe('bubble-sort')
    expect(lesson!.rawContent).toContain('Bubble Sort')
    expect(lesson!.grade).toBe(9)
  })

  it('returns null for unknown slug', async () => {
    const lesson = await getLessonBySlug('nu-exista-lectia-asta')
    expect(lesson).toBeNull()
  })
})

describe('getLessonsByGrade()', () => {
  it('returns only grade 9 lessons', async () => {
    const lessons = await getLessonsByGrade(9)
    expect(lessons.length).toBeGreaterThanOrEqual(1)
    for (const l of lessons) {
      expect(l.grade).toBe(9)
    }
  })

  it('returns empty array for grade with no lessons', async () => {
    const lessons = await getLessonsByGrade(12)
    expect(Array.isArray(lessons)).toBe(true)
  })
})

describe('getChaptersByGrade()', () => {
  it('returns chapters for grade 9', async () => {
    const chapters = await getChaptersByGrade(9)
    expect(chapters).toContain('sortare')
  })

  it('returns unique chapters only', async () => {
    const chapters = await getChaptersByGrade(9)
    const unique = [...new Set(chapters)]
    expect(chapters).toEqual(unique)
  })
})
```

- [ ] **Step 2: Run tests — verify loader tests FAIL**

```powershell
pnpm test
```

Expected: schema tests pass (8), loader tests fail with `Cannot find module '@/lib/content/lessons'`

- [ ] **Step 3: Create lib/content/lessons.ts**

```typescript
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { LessonFrontmatterSchema } from './types'
import type { LessonMeta, LessonWithContent } from './types'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'lessons')

let _cache: LessonMeta[] | null = null

function walkMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkMdxFiles(full))
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      files.push(full)
    }
  }
  return files
}

export async function getAllLessons(): Promise<LessonMeta[]> {
  if (_cache) return _cache

  const files = walkMdxFiles(CONTENT_DIR)
  const lessons: LessonMeta[] = []

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data } = matter(raw)

    let frontmatter
    try {
      frontmatter = LessonFrontmatterSchema.parse(data)
    } catch (err) {
      const rel = path.relative(CONTENT_DIR, filePath)
      console.warn(`[content] Invalid frontmatter in ${rel}:`, err)
      continue
    }

    lessons.push({
      ...frontmatter,
      filePath: path.relative(CONTENT_DIR, filePath),
    })
  }

  lessons.sort((a, b) => a.grade - b.grade || a.chapter.localeCompare(b.chapter))
  _cache = lessons
  return _cache
}

export async function getLessonBySlug(
  slug: string,
): Promise<LessonWithContent | null> {
  const all = await getAllLessons()
  const meta = all.find((l) => l.slug === slug)
  if (!meta) return null

  const filePath = path.join(CONTENT_DIR, meta.filePath)
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { content } = matter(raw)

  return { ...meta, rawContent: content }
}

export async function getLessonsByGrade(grade: number): Promise<LessonMeta[]> {
  const all = await getAllLessons()
  return all.filter((l) => l.grade === grade)
}

export async function getChaptersByGrade(grade: number): Promise<string[]> {
  const lessons = await getLessonsByGrade(grade)
  const seen = new Set<string>()
  for (const l of lessons) seen.add(l.chapter)
  return [...seen]
}
```

- [ ] **Step 4: Run tests — verify ALL pass**

```powershell
pnpm test
```

Expected: all tests pass (8 schema + 9 loader = 17 total)

- [ ] **Step 5: Commit**

```bash
git add lib/content/lessons.ts __tests__/content/lessons.test.ts
git commit -m "feat: lesson file loaders with build cache"
```

---

### Task 6: lib/highlighter.ts — shiki Singleton

**Files:**
- Create: `lib/highlighter.ts`

- [ ] **Step 1: Create lib/highlighter.ts**

```typescript
import { createHighlighter, type Highlighter } from 'shiki'

let _highlighter: Highlighter | null = null

export async function getHighlighter(): Promise<Highlighter> {
  if (_highlighter) return _highlighter
  _highlighter = await createHighlighter({
    themes: ['github-dark'],
    langs: ['cpp', 'c', 'python', 'javascript', 'typescript', 'bash', 'text'],
  })
  return _highlighter
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/highlighter.ts
git commit -m "feat: shiki highlighter singleton"
```

---

### Task 7: components/mdx/ — MDX Component Suite

**Files:**
- Create: `components/mdx/CopyButton.tsx`
- Create: `components/mdx/CodeBlock.tsx`
- Create: `components/mdx/LessonHook.tsx`
- Create: `components/mdx/Visualizer.tsx`
- Create: `components/mdx/index.ts`

- [ ] **Step 1: Create components/mdx/CopyButton.tsx**

```tsx
'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface CopyButtonProps {
  code: string
}

export function CopyButton({ code }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? 'Copiat!' : 'Copiază codul'}
      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-400" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  )
}
```

- [ ] **Step 2: Create components/mdx/CodeBlock.tsx**

```tsx
import { getHighlighter } from '@/lib/highlighter'
import { CopyButton } from './CopyButton'

interface CodeBlockProps {
  language?: string
  children: string
}

export async function CodeBlock({
  language = 'cpp',
  children,
}: CodeBlockProps) {
  const code = children.trim()
  const highlighter = await getHighlighter()
  const html = highlighter.codeToHtml(code, {
    lang: language,
    theme: 'github-dark',
  })

  return (
    <div className="group relative my-5 overflow-hidden rounded-[14px]">
      <div
        className="overflow-x-auto text-[13.5px] leading-[1.6] [&>pre]:p-5"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <CopyButton code={code} />
    </div>
  )
}
```

- [ ] **Step 3: Create components/mdx/LessonHook.tsx**

```tsx
import { cn } from '@/lib/utils'

interface LessonHookProps {
  children: React.ReactNode
  className?: string
}

export function LessonHook({ children, className }: LessonHookProps) {
  return (
    <div
      className={cn(
        'my-6 rounded-[16px] border border-primary/20 bg-accent px-6 py-5',
        'text-[15px] leading-[1.65] text-foreground',
        className,
      )}
    >
      <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
        De ce contează?
      </p>
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Create components/mdx/Visualizer.tsx**

```tsx
interface VisualizerProps {
  name: string
}

export function Visualizer({ name }: VisualizerProps) {
  return (
    <div className="my-6 flex min-h-[200px] items-center justify-center rounded-[16px] border-2 border-dashed border-border bg-muted/30">
      <p className="font-mono text-sm text-muted-foreground">
        Vizualizare: <span className="text-primary">{name}</span>
        <span className="ml-2 opacity-60">(disponibil în curând)</span>
      </p>
    </div>
  )
}
```

- [ ] **Step 5: Create components/mdx/index.ts**

```typescript
import { HintBox } from '@/components/lesson/HintBox'
import { ObservationBox } from '@/components/lesson/ObservationBox'
import { MistakeBox } from '@/components/lesson/MistakeBox'
import { CodeBlock } from './CodeBlock'
import { LessonHook } from './LessonHook'
import { Visualizer } from './Visualizer'

export const MDX_COMPONENTS = {
  HintBox,
  ObservationBox,
  MistakeBox,
  CodeBlock,
  LessonHook,
  Visualizer,
}
```

- [ ] **Step 6: Type check**

```powershell
pnpm tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 7: Commit**

```bash
git add components/mdx/ lib/highlighter.ts
git commit -m "feat: MDX components (CodeBlock/shiki, LessonHook, Visualizer)"
```

---

### Task 8: vitest.config.ts + Final Verify + Commit

**Files:**
- Modify: `vitest.config.ts` (created in Task 1)

- [ ] **Step 1: Run all tests**

```powershell
pnpm test
```

Expected: all 17 tests pass.

- [ ] **Step 2: Full type check**

```powershell
pnpm tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Build**

```powershell
pnpm build
```

Expected: clean build, 0 errors.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: content pipeline lectii MDX"
```

---

## Self-Review

**Spec coverage:**
- [x] `content/lessons/grade-<n>/<chapter>/<slug>.mdx` structure
- [x] Frontmatter validated with Zod: title, slug, grade, chapter, difficulty, estimatedTime, free (default true), tags[], visualizers[], relatedProblems[]
- [x] `getAllLessons()`, `getLessonBySlug()`, `getLessonsByGrade()`, `getChaptersByGrade()` — with build cache
- [x] MDX solution chosen and justified: next-mdx-remote/rsc
- [x] `<LessonHook>` — styled opening callout
- [x] `<ObservationBox>`, `<MistakeBox>`, `<HintBox>` — re-exported from existing lesson components
- [x] `<CodeBlock language="cpp">` — shiki syntax highlighting + copy button
- [x] `<Visualizer name="..." />` — placeholder
- [x] `data/curriculum.ts` — V–XII structure typed
- [x] 2 demo real lessons (bubble-sort gr. 9, factorial gr. 7)
- [x] Tests for loader + frontmatter validation
- [x] Commit: "feat: content pipeline lectii MDX"

**Gaps:**
- curriculum.ts is a best-guess reconstruction; update per Section 7 of the original design doc before launch
- Lesson page route (`app/invata/[grade]/[chapter]/[slug]/page.tsx`) is NOT in scope here — covered in next plan step

**Type consistency:**
- `LessonMeta` extends `LessonFrontmatter` — `LessonFrontmatter` = `z.infer<typeof LessonFrontmatterSchema>`
- `LessonWithContent` extends `LessonMeta` + `rawContent: string`
- `getAllLessons()` returns `LessonMeta[]`, `getLessonBySlug()` returns `LessonWithContent | null`
- `MDX_COMPONENTS` object keys match JSX element names used in demo MDX files
