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
