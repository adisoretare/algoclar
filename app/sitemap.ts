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
