# Content Pipeline Lecții MDX — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finalizare pipeline conținut lecții MDX: fix sortare capitole, pagina /invata listing, commit.

**Architecture:** Infrastructura principală există deja (types, loader, MDX components, curriculum, 2 lecții demo, tests). Rămân 3 gap-uri: `getChaptersByGrade()` ignoră ordinea din curriculum, pagina `/invata` e stub, testul pentru ordine capitole lipsește.

**MDX Choice:** `next-mdx-remote/rsc` cu `compileMDX` — compilează MDX server-side per request/build, suportă RSC components native, funcționează cu conținut dinamic din filesystem fără webpack config. `@next/mdx` necesită bundling la build-time (nepotrivit pentru fișiere separate) și nu suportă componente async în MDX la fel de clean.

**Tech Stack:** Next.js App Router, next-mdx-remote/rsc, Zod, vitest, Tailwind, shadcn/ui

---

## Status: Ce există deja

| Fișier | Stare |
|--------|-------|
| `lib/content/types.ts` | done — LessonFrontmatterSchema complet |
| `lib/content/lessons.ts` | done — getAllLessons, getLessonBySlug, getLessonsByGrade, getChaptersByGrade + cache |
| `components/mdx/` | done — LessonHook, ObservationBox, MistakeBox, HintBox, CodeBlock+shiki+copy, Visualizer |
| `data/curriculum.ts` | done — V-XII complet cu ordine |
| `content/lessons/grade-9/sortare/bubble-sort.mdx` | done |
| `content/lessons/grade-7/recursivitate/factorial.mdx` | done |
| `app/invata/[grade]/[chapter]/[slug]/page.tsx` | done — compileMDX + generateStaticParams |
| `__tests__/content/lessons.test.ts` | done — schema + loader tests |

---

## File Structure — Ce modificam

| Actiune | Fisier | Responsabilitate |
|---------|--------|-----------------|
| Modify | `lib/content/lessons.ts:75-80` | Fix sort in getChaptersByGrade() — ordinea din curriculum |
| Modify | `__tests__/content/lessons.test.ts:136-147` | Test pentru ordinea capitolelor |
| Modify | `app/invata/page.tsx` | Listing pagina V-XII cu lectii grupate pe clasa/capitol |

---

## Task 1: Fix getChaptersByGrade() sort order

**Files:**
- Modify: `lib/content/lessons.ts:75-80`

- [ ] **Step 1: Verifica testele existente**

Run: `pnpm vitest run __tests__/content/lessons.test.ts --reporter=verbose 2>&1`

Expected: toate trec

- [ ] **Step 2: Fix getChaptersByGrade() sa foloseasca curriculum order**

Inlocuieste functia curenta din `lib/content/lessons.ts` (liniile 75-80):

```typescript
import { CURRICULUM } from '@/data/curriculum'

export async function getChaptersByGrade(grade: number): Promise<string[]> {
  const lessons = await getLessonsByGrade(grade)
  const lessonChapters = new Set(lessons.map((l) => l.chapter))

  const gradeData = CURRICULUM.find((g) => g.grade === grade)
  if (gradeData) {
    return gradeData.chapters
      .filter((c) => lessonChapters.has(c.id))
      .map((c) => c.id)
  }

  return [...lessonChapters].sort()
}
```

- [ ] **Step 3: Run tests**

Run: `pnpm vitest run __tests__/content/lessons.test.ts --reporter=verbose 2>&1`

Expected: toate trec

---

## Task 2: Test pentru ordinea capitolelor

**Files:**
- Modify: `__tests__/content/lessons.test.ts`

- [ ] **Step 1: Adauga 2 teste de ordine in describe('getChaptersByGrade()')**

Adauga dupa `'returns unique chapters only'` (linia 144):

```typescript
it('returns chapters in curriculum order for grade 7', async () => {
  const chapters = await getChaptersByGrade(7)
  // grade-7 are doar recursivitate/factorial.mdx
  expect(chapters[0]).toBe('recursivitate')
})

it('returns chapters in curriculum order for grade 9', async () => {
  const chapters = await getChaptersByGrade(9)
  // grade-9 are doar sortare/bubble-sort.mdx
  expect(chapters[0]).toBe('sortare')
})
```

- [ ] **Step 2: Run tests**

Run: `pnpm vitest run __tests__/content/lessons.test.ts --reporter=verbose 2>&1`

Expected: PASS — inclusiv cele 2 teste noi

---

## Task 3: Pagina /invata — curriculum listing

**Files:**
- Modify: `app/invata/page.tsx`
- Read first: `components/lesson/LessonCard.tsx` (verifica interfata)

- [ ] **Step 1: Citeste LessonCard.tsx si verifica interfata**

Read `components/lesson/LessonCard.tsx`. Daca nu are prop `href`, adauga-l.

- [ ] **Step 2: Inlocuieste stub-ul din `app/invata/page.tsx`**

```tsx
import { getAllLessons } from '@/lib/content/lessons'
import { CURRICULUM } from '@/data/curriculum'
import { LessonCard } from '@/components/lesson/LessonCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Invata Algoritmica — AlgoClar',
  description: 'Lectii de algoritmica pentru clasele V-XII. Intelegi, nu memorezi.',
}

export default async function InvataPage() {
  const allLessons = await getAllLessons()

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <header className="mb-12">
        <h1 className="font-heading text-4xl font-bold text-foreground">
          Invata algoritmica
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Lectii structurate pentru clasele V-XII. Intelegi, nu memorezi.
        </p>
      </header>

      <div className="space-y-16">
        {CURRICULUM.map((gradeData) => {
          const gradeLessons = allLessons.filter((l) => l.grade === gradeData.grade)
          if (gradeLessons.length === 0) return null

          return (
            <section key={gradeData.grade}>
              <h2 className="mb-6 font-heading text-2xl font-semibold text-foreground">
                {gradeData.label}
              </h2>
              <div className="space-y-8">
                {gradeData.chapters.map((chapter) => {
                  const chapterLessons = gradeLessons.filter(
                    (l) => l.chapter === chapter.id,
                  )
                  if (chapterLessons.length === 0) return null

                  return (
                    <div key={chapter.id}>
                      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        {chapter.title}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {chapterLessons.map((lesson) => (
                          <LessonCard
                            key={lesson.slug}
                            lesson={lesson}
                            href={`/invata/${lesson.grade}/${lesson.chapter}/${lesson.slug}`}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Run type check**

Run: `pnpm tsc --noEmit 2>&1`

Expected: 0 erori noi

- [ ] **Step 4: Run toate testele**

Run: `pnpm vitest run 2>&1`

Expected: toate trec

---

## Task 4: Commit

- [ ] **Step 1: Stage si commit**

```bash
git add lib/content/lessons.ts __tests__/content/lessons.test.ts app/invata/page.tsx
git commit -m "feat: content pipeline lectii MDX"
```
