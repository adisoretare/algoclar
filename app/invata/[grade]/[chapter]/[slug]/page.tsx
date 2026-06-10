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
