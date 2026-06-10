import { getAllLessons } from '@/lib/content/lessons'
import { CURRICULUM } from '@/data/curriculum'
import { LessonCard } from '@/components/lesson/LessonCard'
import type { Metadata } from 'next'
import type { Difficulty } from '@/components/shared/DifficultyBadge'

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
                            href={`/invata/${lesson.grade}/${lesson.chapter}/${lesson.slug}`}
                            chapter={lesson.chapter}
                            title={lesson.title}
                            duration={`${lesson.estimatedTime} min`}
                            difficulty={lesson.difficulty as Difficulty}
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
