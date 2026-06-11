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

  if (!gradeData) return notFound()

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
