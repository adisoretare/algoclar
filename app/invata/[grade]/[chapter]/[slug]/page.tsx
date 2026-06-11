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
