# Navigare Învățare — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the full learning navigation: /invata (grade cards), /invata/[grade] (chapter listing), /invata/[grade]/[chapter]/[slug] (lesson with sidebar + prev/next), and sitemap.

**Architecture:** /invata becomes 8 GradeCard components computed from CURRICULUM + lesson counts. /invata/[grade] lists all chapters (dimmed with "în curând" if empty). The lesson page gets a ChapterSidebar client component (collapsible desktop, drawer mobile) and prev/next navigation ordered by curriculum grade → chapter.order → slug. All routes use generateStaticParams for SSG. Sitemap via app/sitemap.ts (Next.js built-in).

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Tailwind CSS v4, shadcn/ui, lucide-react, next-mdx-remote/rsc, existing design tokens

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `lib/content/lessons.ts` | Add `getLessonsForChapter()` + `getPrevNextLesson()` |
| Modify | `__tests__/content/lessons.test.ts` | Tests for the two new helpers |
| Create | `components/lesson/GradeCard.tsx` | Grade card with chapter/lesson counts |
| Modify | `app/invata/page.tsx` | 8 grade cards (all V–XII, even empty) |
| Create | `app/invata/[grade]/page.tsx` | Chapter listing; empty chapters dimmed + "în curând" |
| Create | `components/lesson/ChapterSidebar.tsx` | Client: collapsible sidebar / mobile drawer |
| Modify | `app/invata/[grade]/[chapter]/[slug]/page.tsx` | Flex layout with sidebar + prev/next nav |
| Create | `app/sitemap.ts` | Dynamic sitemap for all lesson + grade pages |

---

## Task 1: Add helpers to lessons.ts — TDD

**Files:**
- Modify: `lib/content/lessons.ts`
- Modify: `__tests__/content/lessons.test.ts`

- [ ] **Step 1.1: Write failing tests — append to `__tests__/content/lessons.test.ts`**

First, update the import at line 70–75 of the test file:

```typescript
import {
  getAllLessons,
  getLessonBySlug,
  getLessonsByGrade,
  getChaptersByGrade,
  getLessonsForChapter,
  getPrevNextLesson,
} from '@/lib/content/lessons'
```

Then append after the last `describe` block (after line 159):

```typescript
describe('getLessonsForChapter()', () => {
  it('returns lessons matching grade + chapter', async () => {
    const lessons = await getLessonsForChapter(9, 'cautare-binara')
    expect(lessons.length).toBeGreaterThan(0)
    for (const l of lessons) {
      expect(l.grade).toBe(9)
      expect(l.chapter).toBe('cautare-binara')
    }
  })

  it('returns empty array for chapter with no content', async () => {
    const lessons = await getLessonsForChapter(12, 'algoritmi-avansati')
    expect(lessons).toEqual([])
  })
})

describe('getPrevNextLesson()', () => {
  it('returns null/null for unknown slug', async () => {
    const result = await getPrevNextLesson('slug-inexistent')
    expect(result.prev).toBeNull()
    expect(result.next).toBeNull()
  })

  it('cautare-binara (grade 9, chapter order 2) has a prev lesson', async () => {
    // grade-9 chapter "cautare-binara" has order:2; there are lessons in grades 5,6,7,9(sortare)
    const { prev } = await getPrevNextLesson('cautare-binara')
    expect(prev).not.toBeNull()
  })

  it('prev lesson comes from lower grade or earlier chapter order', async () => {
    const { prev } = await getPrevNextLesson('cautare-binara')
    if (!prev) return
    // prev must be grade ≤ 9
    expect(prev.grade).toBeLessThanOrEqual(9)
  })

  it('bubble-sort next is cautare-binara (same grade, chapter order 1 < 2)', async () => {
    const { next } = await getPrevNextLesson('bubble-sort')
    // grade-9 sortare (order 1) → next is grade-9 cautare-binara (order 2)
    expect(next?.slug).toBe('cautare-binara')
  })
})
```

- [ ] **Step 1.2: Run tests — confirm new tests fail**

```powershell
pnpm vitest run __tests__/content/lessons.test.ts --reporter=verbose 2>&1
```

Expected: `getLessonsForChapter` and `getPrevNextLesson` tests fail with "is not a function". Existing tests still pass.

- [ ] **Step 1.3: Implement helpers in `lib/content/lessons.ts`**

Append after the closing brace of `getChaptersByGrade()` (after line 88):

```typescript
export async function getLessonsForChapter(
  grade: number,
  chapterId: string,
): Promise<LessonMeta[]> {
  const all = await getAllLessons()
  return all.filter((l) => l.grade === grade && l.chapter === chapterId)
}

function getChapterOrderInGrade(grade: number, chapterId: string): number {
  const gradeData = CURRICULUM.find((g) => g.grade === grade)
  return gradeData?.chapters.find((c) => c.id === chapterId)?.order ?? 99
}

function sortLessonsByCurriculum(lessons: LessonMeta[]): LessonMeta[] {
  return [...lessons].sort((a, b) => {
    if (a.grade !== b.grade) return a.grade - b.grade
    const aOrder = getChapterOrderInGrade(a.grade, a.chapter)
    const bOrder = getChapterOrderInGrade(b.grade, b.chapter)
    if (aOrder !== bOrder) return aOrder - bOrder
    return a.slug.localeCompare(b.slug)
  })
}

export async function getPrevNextLesson(currentSlug: string): Promise<{
  prev: LessonMeta | null
  next: LessonMeta | null
}> {
  const all = await getAllLessons()
  const sorted = sortLessonsByCurriculum(all)
  const idx = sorted.findIndex((l) => l.slug === currentSlug)
  if (idx === -1) return { prev: null, next: null }
  return {
    prev: idx > 0 ? sorted[idx - 1] : null,
    next: idx < sorted.length - 1 ? sorted[idx + 1] : null,
  }
}
```

- [ ] **Step 1.4: Run all tests — confirm all pass**

```powershell
pnpm vitest run __tests__/content/lessons.test.ts --reporter=verbose 2>&1
```

Expected: all tests pass including the 5 new ones.

- [ ] **Step 1.5: Commit**

```bash
git add lib/content/lessons.ts __tests__/content/lessons.test.ts
git commit -m "feat(content): getLessonsForChapter + getPrevNextLesson with tests"
```

---

## Task 2: GradeCard component + /invata redesign

**Files:**
- Create: `components/lesson/GradeCard.tsx`
- Modify: `app/invata/page.tsx`

- [ ] **Step 2.1: Create `components/lesson/GradeCard.tsx`**

```tsx
import Link from 'next/link'
import { BookOpen, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GradeCardProps {
  grade: number
  label: string
  chapterCount: number
  lessonCount: number
  href: string
}

export function GradeCard({
  grade,
  label,
  chapterCount,
  lessonCount,
  href,
}: GradeCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col gap-4 rounded-[16px] border border-border bg-card p-[22px]',
        'shadow-[0_1px_2px_rgba(19,24,38,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.30)]',
        'transition-all duration-[180ms]',
        'hover:-translate-y-[3px] hover:border-primary',
        'hover:shadow-[0_14px_32px_-14px_rgba(19,24,38,0.22),0_2px_6px_rgba(19,24,38,0.05)]',
        'dark:hover:shadow-[0_16px_36px_-14px_rgba(0,0,0,0.60),0_2px_6px_rgba(0,0,0,0.40)]',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
          Clasa {grade}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>

      <h2 className="font-heading text-[20px] font-semibold leading-snug text-card-foreground">
        {label}
      </h2>

      <div className="flex items-center gap-4 text-[13px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 opacity-70" />
          {chapterCount} {chapterCount === 1 ? 'capitol' : 'capitole'}
        </span>
        {lessonCount > 0 && (
          <span className="font-mono text-primary">
            {lessonCount} {lessonCount === 1 ? 'lecție' : 'lecții'}
          </span>
        )}
      </div>
    </Link>
  )
}
```

- [ ] **Step 2.2: Replace `app/invata/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { getAllLessons } from '@/lib/content/lessons'
import { CURRICULUM } from '@/data/curriculum'
import { GradeCard } from '@/components/lesson/GradeCard'

export const metadata: Metadata = {
  title: 'Învață Algoritmică — AlgoClar',
  description: 'Lecții de algoritmică pentru clasele V–XII. Înțelegi, nu memorezi.',
}

export default async function InvataPage() {
  const allLessons = await getAllLessons()

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <header className="mb-12">
        <h1 className="font-heading text-4xl font-bold text-foreground">
          Învață algoritmică
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Lecții structurate pentru clasele V–XII. Înțelegi, nu memorezi.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {CURRICULUM.map((gradeData) => {
          const lessonCount = allLessons.filter(
            (l) => l.grade === gradeData.grade,
          ).length

          return (
            <GradeCard
              key={gradeData.grade}
              grade={gradeData.grade}
              label={gradeData.label}
              chapterCount={gradeData.chapters.length}
              lessonCount={lessonCount}
              href={`/invata/${gradeData.grade}`}
            />
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2.3: Type check**

```powershell
pnpm tsc --noEmit 2>&1
```

Expected: 0 errors.

- [ ] **Step 2.4: Commit**

```bash
git add components/lesson/GradeCard.tsx app/invata/page.tsx
git commit -m "feat: /invata grade cards V–XII"
```

---

## Task 3: /invata/[grade] — chapter listing page

**Files:**
- Create: `app/invata/[grade]/page.tsx`

- [ ] **Step 3.1: Create `app/invata/[grade]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllLessons } from '@/lib/content/lessons'
import { CURRICULUM } from '@/data/curriculum'
import { LessonCard } from '@/components/lesson/LessonCard'
import { cn } from '@/lib/utils'
import type { Difficulty } from '@/components/shared/DifficultyBadge'

interface Params {
  grade: string
}

export function generateStaticParams() {
  return CURRICULUM.map((g) => ({ grade: String(g.grade) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { grade } = await params
  const gradeData = CURRICULUM.find((g) => g.grade === Number(grade))
  if (!gradeData) return {}
  return {
    title: `${gradeData.label} — AlgoClar`,
    description: `Capitolele de algoritmică pentru ${gradeData.label}. ${gradeData.chapters.length} capitole disponibile.`,
  }
}

export default async function GradePage({
  params,
}: {
  params: Promise<Params>
}) {
  const { grade } = await params
  const gradeNum = Number(grade)
  const gradeData = CURRICULUM.find((g) => g.grade === gradeNum)

  if (!gradeData) notFound()

  const allLessons = await getAllLessons()
  const gradeLessons = allLessons.filter((l) => l.grade === gradeNum)

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <nav className="mb-8 flex items-center gap-2 font-mono text-[12.5px] text-muted-foreground">
        <Link
          href="/invata"
          className="transition-colors hover:text-foreground"
        >
          Învață
        </Link>
        <span className="text-muted-foreground/40">›</span>
        <span className="text-foreground">{gradeData.label}</span>
      </nav>

      <header className="mb-12">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          {gradeData.label}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {gradeData.chapters.length} capitole ·{' '}
          {gradeLessons.length}{' '}
          {gradeLessons.length === 1 ? 'lecție disponibilă' : 'lecții disponibile'}
        </p>
      </header>

      <div className="space-y-12">
        {gradeData.chapters.map((chapter) => {
          const chapterLessons = gradeLessons.filter(
            (l) => l.chapter === chapter.id,
          )
          const hasLessons = chapterLessons.length > 0

          return (
            <section
              key={chapter.id}
              className={cn(!hasLessons && 'opacity-50')}
            >
              <div className="mb-4 flex items-center gap-3">
                <h2 className="font-heading text-xl font-semibold text-foreground">
                  {chapter.title}
                </h2>
                {!hasLessons && (
                  <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                    în curând
                  </span>
                )}
              </div>

              {hasLessons ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {chapterLessons.map((lesson) => (
                    <LessonCard
                      key={lesson.slug}
                      href={`/invata/${lesson.grade}/${lesson.chapter}/${lesson.slug}`}
                      chapter={chapter.title}
                      title={lesson.title}
                      duration={`${lesson.estimatedTime} min`}
                      difficulty={lesson.difficulty as Difficulty}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center rounded-[12px] border border-dashed border-border p-4">
                  <p className="font-mono text-xs text-muted-foreground">
                    Lecții în pregătire
                  </p>
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 3.2: Type check**

```powershell
pnpm tsc --noEmit 2>&1
```

Expected: 0 errors. Note: TypeScript 5 narrows `gradeData` to non-undefined after `if (!gradeData) notFound()`. If it doesn't, add `!` assertion on `gradeData` usages in JSX.

- [ ] **Step 3.3: Commit**

```bash
git add "app/invata/[grade]/page.tsx"
git commit -m "feat: /invata/[grade] chapter listing with coming-soon placeholders"
```

---

## Task 4: ChapterSidebar client component

**Files:**
- Create: `components/lesson/ChapterSidebar.tsx`

Desktop: sticky 288px sidebar, collapsible via `w-0` transition. Mobile (≤900px): fixed full-height drawer with scrim overlay. Status icons are visual placeholders (before current = done, current = in-progress, after = todo).

- [ ] **Step 4.1: Create `components/lesson/ChapterSidebar.tsx`**

```tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, PanelLeft, CheckCircle, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ChapterLesson {
  slug: string
  title: string
  grade: number
  chapter: string
}

interface ChapterSidebarProps {
  gradeLabel: string
  chapterTitle: string
  chapterOrder: number
  lessons: ChapterLesson[]
  currentSlug: string
}

export function ChapterSidebar({
  gradeLabel,
  chapterTitle,
  chapterOrder,
  lessons,
  currentSlug,
}: ChapterSidebarProps) {
  const [open, setOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)')
    const update = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches)
      if (e.matches) setOpen(false)
    }
    update(mq)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const currentIndex = lessons.findIndex((l) => l.slug === currentSlug)

  return (
    <>
      {/* Mobile FAB — shown when drawer is closed */}
      {isMobile && !open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Deschide meniu capitol"
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
      )}

      {/* Mobile scrim */}
      {isMobile && open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        aria-label="Lecții capitol"
        className={cn(
          'z-50 flex-shrink-0 border-r border-border bg-card transition-all duration-[260ms]',
          isMobile
            ? cn(
                'fixed inset-y-0 left-0 w-[300px] shadow-2xl',
                open ? 'translate-x-0' : '-translate-x-full',
              )
            : cn(
                'sticky top-16 h-[calc(100vh-64px)] overflow-hidden',
                open ? 'w-[288px]' : 'w-0',
              ),
        )}
      >
        {/* Inner container — fixed width prevents content from squishing during transition */}
        <div className="flex h-full w-[288px] flex-col overflow-y-auto">
          {/* Sidebar header — sticky within the scrollable panel */}
          <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                  {gradeLabel} · Cap. {chapterOrder}
                </span>
                <p className="font-heading text-[15px] font-semibold leading-snug text-foreground">
                  {chapterTitle}
                </p>
                <span className="font-mono text-xs text-muted-foreground">
                  {Math.max(0, currentIndex)}/{lessons.length} lecții
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label={isMobile ? 'Închide meniu' : 'Pliează sidebar'}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {isMobile ? (
                  <X className="h-4 w-4" />
                ) : (
                  <PanelLeft className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Lesson list */}
          <nav className="flex flex-col p-2">
            {lessons.map((lesson, idx) => {
              const isActive = lesson.slug === currentSlug
              const isDone = idx < currentIndex
              const isCurrent = idx === currentIndex

              return (
                <Link
                  key={lesson.slug}
                  href={`/invata/${lesson.grade}/${lesson.chapter}/${lesson.slug}`}
                  onClick={() => isMobile && setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {isDone ? (
                    <CheckCircle className="h-[18px] w-[18px] flex-shrink-0 text-green-500" />
                  ) : isCurrent ? (
                    <div className="relative flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center">
                      <Circle className="h-[18px] w-[18px] text-primary" />
                      <div className="absolute h-2 w-2 rounded-full bg-primary" />
                    </div>
                  ) : (
                    <Circle className="h-[18px] w-[18px] flex-shrink-0 text-border" />
                  )}
                  <span
                    className={cn(
                      'flex-1 leading-snug',
                      isActive && 'font-medium',
                    )}
                  >
                    {lesson.title}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground/50">
                    {idx + 1}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Desktop expand button — shown when sidebar is collapsed */}
      {!isMobile && !open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Extinde sidebar"
          className="sticky top-16 flex h-9 w-8 flex-shrink-0 items-center justify-center rounded-r-[8px] border-y border-r border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          <PanelLeft className="h-4 w-4 rotate-180" />
        </button>
      )}
    </>
  )
}
```

- [ ] **Step 4.2: Type check**

```powershell
pnpm tsc --noEmit 2>&1
```

Expected: 0 errors.

- [ ] **Step 4.3: Commit**

```bash
git add components/lesson/ChapterSidebar.tsx
git commit -m "feat: ChapterSidebar collapsible/drawer with placeholder statuses"
```

---

## Task 5: Lesson page — sidebar layout + prev/next navigation

**Files:**
- Modify: `app/invata/[grade]/[chapter]/[slug]/page.tsx`

Replace the existing centered-column layout with a flex layout (sidebar + main) and add prev/next navigation.

- [ ] **Step 5.1: Replace `app/invata/[grade]/[chapter]/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Clock, List, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'
import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import {
  getAllLessons,
  getLessonBySlug,
  getLessonsForChapter,
  getPrevNextLesson,
} from '@/lib/content/lessons'
import { MDX_COMPONENTS } from '@/components/mdx'
import { DifficultyBadge } from '@/components/shared/DifficultyBadge'
import { getChapterTitle, getGradeData } from '@/data/curriculum'
import { ChapterSidebar } from '@/components/lesson/ChapterSidebar'
import type { Difficulty } from '@/components/shared/DifficultyBadge'

interface Params {
  grade: string
  chapter: string
  slug: string
}

export async function generateStaticParams() {
  const lessons = await getAllLessons()
  return lessons.map((l) => ({
    grade: String(l.grade),
    chapter: l.chapter,
    slug: l.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const lesson = await getLessonBySlug(slug)
  if (!lesson) return {}
  return {
    title: `${lesson.title} — AlgoClar`,
    description: `Lecție de algoritmică: ${lesson.title}. ~${lesson.estimatedTime} minute, clasa ${lesson.grade}.`,
  }
}

export default async function LessonPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { grade, chapter, slug } = await params
  const lesson = await getLessonBySlug(slug)

  if (!lesson || lesson.grade !== Number(grade) || lesson.chapter !== chapter) {
    notFound()
  }

  const [chapterLessons, prevNext, { content }] = await Promise.all([
    getLessonsForChapter(lesson.grade, lesson.chapter),
    getPrevNextLesson(slug),
    compileMDX({
      source: lesson.rawContent,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      components: MDX_COMPONENTS as any,
      options: { mdxOptions: { remarkPlugins: [remarkGfm] } },
    }),
  ])

  const chapterTitle = getChapterTitle(lesson.grade, lesson.chapter)
  const gradeData = getGradeData(lesson.grade)
  const chapterOrder =
    gradeData?.chapters.find((c) => c.id === lesson.chapter)?.order ?? 1
  const gradeLabel = gradeData?.label ?? `Clasa ${lesson.grade}`

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <ChapterSidebar
        gradeLabel={gradeLabel}
        chapterTitle={chapterTitle}
        chapterOrder={chapterOrder}
        lessons={chapterLessons.map((l) => ({
          slug: l.slug,
          title: l.title,
          grade: l.grade,
          chapter: l.chapter,
        }))}
        currentSlug={slug}
      />

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-[780px] px-6 py-10 pb-20 sm:px-10">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex flex-wrap items-center gap-1.5 font-mono text-[12.5px] text-muted-foreground"
          >
            <Link
              href="/invata"
              className="transition-colors hover:text-primary"
            >
              Învață
            </Link>
            <span className="text-muted-foreground/40">›</span>
            <Link
              href={`/invata/${lesson.grade}`}
              className="transition-colors hover:text-primary"
            >
              Clasa {lesson.grade}
            </Link>
            <span className="text-muted-foreground/40">›</span>
            <Link
              href={`/invata/${lesson.grade}`}
              className="transition-colors hover:text-primary"
            >
              {chapterTitle}
            </Link>
            <span className="text-muted-foreground/40">›</span>
            <span className="font-semibold text-foreground">{lesson.title}</span>
          </nav>

          {/* Lesson header */}
          <header className="mb-10">
            <h1 className="mb-4 font-heading text-[clamp(27px,4vw,42px)] font-extrabold leading-tight tracking-[-0.03em] text-foreground">
              {lesson.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
              <DifficultyBadge level={lesson.difficulty as Difficulty} />
              <span className="flex items-center gap-1.5 text-sm">
                <Clock className="h-3.5 w-3.5 opacity-60" />
                ~{lesson.estimatedTime} min
              </span>
              <span className="flex items-center gap-1.5 text-sm">
                <List className="h-3.5 w-3.5 opacity-60" />
                {chapterLessons.length}{' '}
                {chapterLessons.length === 1 ? 'pas' : 'pași'}
              </span>
            </div>
          </header>

          {/* MDX content */}
          <article className="prose">{content}</article>

          {/* Prev / Next navigation */}
          <nav
            aria-label="Navigare lecții"
            className="mt-16 grid grid-cols-2 gap-4 border-t border-border pt-8"
          >
            {prevNext.prev ? (
              <Link
                href={`/invata/${prevNext.prev.grade}/${prevNext.prev.chapter}/${prevNext.prev.slug}`}
                className="group flex flex-col gap-1 rounded-[12px] border border-border p-4 transition-all hover:-translate-y-[2px] hover:border-primary hover:shadow-md"
              >
                <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Anterioarea
                </span>
                <span className="font-heading text-[15px] font-semibold leading-snug text-foreground group-hover:text-primary">
                  {prevNext.prev.title}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {prevNext.next ? (
              <Link
                href={`/invata/${prevNext.next.grade}/${prevNext.next.chapter}/${prevNext.next.slug}`}
                className="group flex flex-col items-end gap-1 rounded-[12px] border border-border p-4 text-right transition-all hover:-translate-y-[2px] hover:border-primary hover:shadow-md"
              >
                <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  Următoarea
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
                <span className="font-heading text-[15px] font-semibold leading-snug text-foreground group-hover:text-primary">
                  {prevNext.next.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </nav>
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 5.2: Type check**

```powershell
pnpm tsc --noEmit 2>&1
```

Expected: 0 errors. Common issues:
- `getGradeData` must be exported from `data/curriculum.ts` (it is — verified).
- `remarkGfm` must be imported — already in existing file.
- `getLessonsForChapter` and `getPrevNextLesson` added in Task 1.

- [ ] **Step 5.3: Commit**

```bash
git add "app/invata/[grade]/[chapter]/[slug]/page.tsx"
git commit -m "feat: lesson page sidebar layout + prev/next navigation"
```

---

## Task 6: Dynamic sitemap

**Files:**
- Create: `app/sitemap.ts`

Next.js 13.3+ generates `/sitemap.xml` automatically from this file at build time.

- [ ] **Step 6.1: Create `app/sitemap.ts`**

```typescript
import type { MetadataRoute } from 'next'
import { getAllLessons } from '@/lib/content/lessons'
import { CURRICULUM } from '@/data/curriculum'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://algoclar.ro'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lessons = await getAllLessons()

  const lessonEntries: MetadataRoute.Sitemap = lessons.map((l) => ({
    url: `${BASE}/invata/${l.grade}/${l.chapter}/${l.slug}`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const gradeEntries: MetadataRoute.Sitemap = CURRICULUM.map((g) => ({
    url: `${BASE}/invata/${g.grade}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [
    { url: BASE, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/invata`, changeFrequency: 'weekly', priority: 0.9 },
    ...gradeEntries,
    ...lessonEntries,
  ]
}
```

- [ ] **Step 6.2: Type check**

```powershell
pnpm tsc --noEmit 2>&1
```

Expected: 0 errors.

- [ ] **Step 6.3: Commit**

```bash
git add app/sitemap.ts
git commit -m "feat: dynamic sitemap (lesson + grade pages)"
```

---

## Task 7: Full build verification + final commit

- [ ] **Step 7.1: Run all tests**

```powershell
pnpm vitest run 2>&1
```

Expected: all tests pass.

- [ ] **Step 7.2: Build**

```powershell
pnpm build 2>&1
```

Expected output includes:
```
○ /invata
○ /invata/5
○ /invata/6
...
○ /invata/12
● /invata/5/introducere/ce-este-un-algoritm
● /invata/6/...
...
```
`○` = static, `●` = SSG. If build fails with shiki error: verify `next.config.ts` has `serverExternalPackages: ['shiki']`.

- [ ] **Step 7.3: Final commit (squash all feature commits into one)**

If you want a single clean commit as specified:
```powershell
git log --oneline -7
```
Count commits since the feature started, then:
```bash
git rebase -i HEAD~7   # adjust N to match commit count
# In the editor: keep first as "pick", change rest to "squash"
# Edit the combined message to:
```
```
feat: pagini /invata + pagina de lecție

- /invata: grade cards V–XII cu nr. capitole + lecții
- /invata/[grade]: listing capitole cu "în curând" pentru cele fără lecții
- /invata/[grade]/[chapter]/[slug]: sidebar capitol + prev/next navigare
- app/sitemap.ts: sitemap dinamic SSG
- helpers: getLessonsForChapter + getPrevNextLesson cu teste
```

---

## Self-Review

**Spec coverage:**
- [x] `/invata`: grade cards V–XII, chapterCount + lessonCount from content — Task 2
- [x] `/invata/[grade]`: all chapters from curriculum, empty = dimmed + "în curând" — Task 3
- [x] `/invata/[grade]/[chapter]/[slug]`: lesson MDX + sidebar (placeholder statuses) + prev/next — Tasks 4+5
- [x] All routes: `generateStaticParams` for SSG — Tasks 2, 3, existing in lesson page
- [x] SEO metadata per lesson (title + description) — existing + Task 5
- [x] `sitemap.xml` auto-generated — Task 6
- [x] Prev/next from curriculum order (grade → chapter.order → slug) — Task 1+5
- [x] Sidebar: desktop collapsible, mobile drawer with scrim — Task 4
- [x] Sidebar status icons: done/in-progress/todo placeholder — Task 4

**Gaps / deferred:**
- Sidebar progress % in topbar — spec §1; deferred per task description ("legăm de cont la Pasul 23")
- Sidebar toggle in global topbar — currently a FAB on mobile + expand button on desktop (simpler, no global header modification needed)
- `/invata/[grade]/[chapter]` intermediate route — not required by spec (grade page links directly to lesson slugs)

**Type consistency:**
- `ChapterLesson` interface defined in `ChapterSidebar.tsx` and used inline in lesson page (`.map()` call)
- `getPrevNextLesson` returns `LessonMeta` — same type as `getAllLessons()` elements
- `getGradeData()` exported from `data/curriculum.ts` — verified in read
- `compileMDX` parallel with other promises via `Promise.all` — all three resolve independently
