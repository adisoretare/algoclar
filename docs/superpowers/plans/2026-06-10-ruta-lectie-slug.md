# Lesson Slug Route — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `app/invata/[grade]/[chapter]/[slug]` — the static lesson page that compiles MDX with custom components and renders lesson content.

**Architecture:** `generateStaticParams` reads all lessons at build time and returns `{ grade, chapter, slug }` tuples for SSG. The page calls `getLessonBySlug(slug)`, validates that grade+chapter match the URL (preventing misrouting), compiles MDX via `compileMDX` from `next-mdx-remote/rsc` with `MDX_COMPONENTS`, and renders a breadcrumb + header + article layout. Prose styles live in `globals.css` as a `.prose` class.

**Tech Stack:** Next.js 16 App Router (async params), next-mdx-remote/rsc compileMDX, custom `.prose` CSS, existing design tokens

---

## File Map

```
app/globals.css                                        — MODIFY: append .prose styles
app/invata/[grade]/[chapter]/[slug]/page.tsx           — CREATE: lesson page
```

---

### Task 1: Prose CSS — app/globals.css

**Files:**
- Modify: `app/globals.css` (append at end)

No tests — verified visually via build + rendered page.

- [ ] **Step 1: Append `.prose` styles to app/globals.css**

Add exactly this at the end of the file (after the closing `}` of `@layer base`):

```css
/* ============================================================
   Prose — MDX lesson content styles
   ============================================================ */

.prose {
  color: hsl(var(--foreground));
  font-size: 1rem;
  line-height: 1.75;
}

.prose h2 {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  color: hsl(var(--foreground));
}

.prose h3 {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  color: hsl(var(--foreground));
}

.prose p {
  margin-top: 0;
  margin-bottom: 1.25rem;
}

.prose ul,
.prose ol {
  margin-bottom: 1.25rem;
  padding-left: 1.5rem;
}

.prose ul {
  list-style-type: disc;
}

.prose ol {
  list-style-type: decimal;
}

.prose li {
  margin-bottom: 0.375rem;
}

.prose strong {
  font-weight: 600;
}

.prose table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.prose thead {
  border-bottom: 2px solid hsl(var(--border));
}

.prose th {
  padding: 0.5rem 1rem;
  text-align: left;
  font-weight: 600;
}

.prose td {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid hsl(var(--border));
  color: hsl(var(--muted-foreground));
}

.prose tbody tr:last-child td {
  border-bottom: none;
}

.prose a {
  color: hsl(var(--primary));
  text-decoration: underline;
  text-underline-offset: 3px;
}

.prose a:hover {
  opacity: 0.8;
}

.prose :not(pre) > code {
  font-family: var(--font-mono);
  font-size: 0.875em;
  background-color: hsl(var(--muted));
  color: hsl(var(--foreground));
  padding: 0.15em 0.4em;
  border-radius: 4px;
}
```

- [ ] **Step 2: Type check**

```powershell
cd "C:\Users\TIS\Desktop\algoclar.ro"
pnpm tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: prose styles for MDX content"
```

---

### Task 2: Lesson Page Route

**Files:**
- Create: `app/invata/[grade]/[chapter]/[slug]/page.tsx`

- [ ] **Step 1: Create app/invata/[grade]/[chapter]/[slug]/page.tsx**

```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Clock, ChevronLeft } from 'lucide-react'
import type { Metadata } from 'next'
import { compileMDX } from 'next-mdx-remote/rsc'
import { getAllLessons, getLessonBySlug } from '@/lib/content/lessons'
import { MDX_COMPONENTS } from '@/components/mdx'
import { DifficultyBadge } from '@/components/shared/DifficultyBadge'
import { TopicBadge } from '@/components/shared/TopicBadge'
import { getChapterTitle } from '@/data/curriculum'
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
    description: `Lecție de algoritmică: ${lesson.title}. ${lesson.estimatedTime} minute, clasa ${lesson.grade}.`,
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

  const { content } = await compileMDX({
    source: lesson.rawContent,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    components: MDX_COMPONENTS as any,
  })

  const chapterTitle = getChapterTitle(lesson.grade, lesson.chapter)

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/invata"
          className="transition-colors hover:text-foreground"
        >
          Învață
        </Link>
        <span>/</span>
        <span>Clasa {lesson.grade}</span>
        <span>/</span>
        <span>{chapterTitle}</span>
      </nav>

      <header className="mb-10">
        <h1 className="mb-4 font-heading text-4xl font-bold leading-tight text-foreground">
          {lesson.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <DifficultyBadge level={lesson.difficulty as Difficulty} />
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {lesson.estimatedTime} min
          </span>
          {lesson.tags.map((tag) => (
            <TopicBadge key={tag} label={tag} />
          ))}
        </div>
      </header>

      <article className="prose">{content}</article>

      <div className="mt-16 border-t border-border pt-8">
        <Link
          href="/invata"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Înapoi la lecții
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type check**

```powershell
cd "C:\Users\TIS\Desktop\algoclar.ro"
pnpm tsc --noEmit
```

Expected: 0 errors. Common issues and fixes:
- If `compileMDX` import fails: make sure `next-mdx-remote/rsc` is the import path (not `next-mdx-remote`). Package exports map has `./rsc`.
- If `Difficulty` type mismatch: the schema has `'baza' | 'mediu' | 'greu'` which is a subset of `DifficultyBadge`'s `'baza' | 'mediu' | 'greu' | 'baraj'`. The cast `as Difficulty` handles this.
- If `MDX_COMPONENTS as any` causes lint error: the `// eslint-disable-next-line` comment suppresses it.

- [ ] **Step 3: Build — this validates generateStaticParams + compileMDX for all lessons**

```powershell
pnpm build
```

Expected: 2 lesson pages generated under `/invata/`:
```
├ ○ /invata
├ ● /invata/7/recursivitate/factorial
└ ● /invata/9/sortare/bubble-sort
```
(● = static pre-rendered)

If build fails with `shiki` errors: check that `next.config.ts` still has `serverExternalPackages: ['shiki']`.

If build fails with MDX compilation errors (syntax in .mdx files): the error will show the problematic file and line.

- [ ] **Step 4: Commit**

```bash
git add app/invata/
git commit -m "feat: ruta lectie /invata/[grade]/[chapter]/[slug]"
```

---

## Self-Review

**Spec coverage:**
- [x] Route `app/invata/[grade]/[chapter]/[slug]/page.tsx`
- [x] `generateStaticParams` — all lessons from `getAllLessons()`
- [x] `generateMetadata` — title + description from frontmatter
- [x] MDX compiled with `compileMDX` from `next-mdx-remote/rsc`
- [x] `MDX_COMPONENTS` passed to compileMDX
- [x] `notFound()` on missing slug or grade/chapter mismatch
- [x] Breadcrumb: Învață / Clasa X / ChapterTitle
- [x] Header: h1 + DifficultyBadge + time + TopicBadge tags
- [x] Prose styles in globals.css for all MDX-generated HTML elements
- [x] Back link to /invata

**Gaps:**
- No E2E test — build success + correct SSG output is the smoke test
- `app/invata/page.tsx` still shows "În curând" stub — lesson listing is a separate task

**Type consistency:**
- `lesson.difficulty` cast to `Difficulty` — schema `'baza'|'mediu'|'greu'` is subset of badge's `'baza'|'mediu'|'greu'|'baraj'`
- `MDX_COMPONENTS as any` — CodeBlock is async RSC, not a standard `React.ComponentType`; cast silences type error, runtime is correct
- Params `grade: string` parsed to number via `Number(grade)` for comparison with `lesson.grade: number`
