import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllLessons } from '@/lib/content/lessons'
import {
  CURRICULUM,
  getGradeById,
  gradeNumbers,
} from '@/data/curriculum'
import { LessonCard } from '@/components/lesson/LessonCard'
import { cn } from '@/lib/utils'
import type { Difficulty } from '@/components/shared/DifficultyBadge'

interface Params {
  grade: string
}

export function generateStaticParams() {
  return CURRICULUM.map((g) => ({ grade: g.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { grade } = await params
  const gradeData = getGradeById(grade)
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
  const gradeData = getGradeById(grade)

  if (!gradeData) return notFound()

  const allLessons = await getAllLessons()
  const nums = gradeNumbers(grade)
  const gradeLessons = allLessons.filter((l) => nums.includes(l.grade))

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <nav className="mb-8 flex items-center gap-2 font-mono text-[12.5px] text-muted-foreground">
        <Link href="/invata" className="transition-colors hover:text-foreground">
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
          const isExt = chapter.isNationalExtension
          const isBaraj = chapter.isBaraj

          return (
            <section key={chapter.id}>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <h2 className="font-heading text-xl font-semibold text-foreground">
                  {chapter.title}
                </h2>
                {isExt && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-mono text-[11px] text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    Etapa națională
                  </span>
                )}
                {isBaraj && (
                  <span className="rounded-full bg-violet-100 px-2.5 py-0.5 font-mono text-[11px] text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                    Baraj
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {chapter.lessons.map((currLesson) => {
                  const mdxLesson = gradeLessons.find(
                    (l) => l.slug === currLesson.id && l.chapter === chapter.id,
                  )

                  if (mdxLesson) {
                    return (
                      <div
                        key={currLesson.id}
                        className={cn(
                          currLesson.isBridge && 'italic opacity-60',
                        )}
                      >
                        <LessonCard
                          href={`/invata/${grade}/${chapter.id}/${currLesson.id}`}
                          chapter={chapter.title}
                          title={mdxLesson.title}
                          duration={`${mdxLesson.estimatedTime} min`}
                          difficulty={mdxLesson.difficulty as Difficulty}
                        />
                      </div>
                    )
                  }

                  return (
                    <div
                      key={currLesson.id}
                      className={cn(
                        'flex items-center justify-between rounded-[10px] border border-dashed border-border px-4 py-3',
                        currLesson.isBridge && 'opacity-60',
                      )}
                    >
                      <span
                        className={cn(
                          'text-sm text-muted-foreground',
                          currLesson.isBridge && 'italic',
                        )}
                      >
                        {currLesson.title}
                      </span>
                      <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                        în curând
                      </span>
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
