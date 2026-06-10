import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { LessonFrontmatterSchema } from './types'
import type { LessonMeta, LessonWithContent } from './types'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'lessons')

let _cache: LessonMeta[] | null = null

function walkMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkMdxFiles(full))
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      files.push(full)
    }
  }
  return files
}

export async function getAllLessons(): Promise<LessonMeta[]> {
  if (_cache) return _cache

  const files = walkMdxFiles(CONTENT_DIR)
  const lessons: LessonMeta[] = []

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { data } = matter(raw)

    let frontmatter
    try {
      frontmatter = LessonFrontmatterSchema.parse(data)
    } catch (err) {
      const rel = path.relative(CONTENT_DIR, filePath)
      console.warn(`[content] Invalid frontmatter in ${rel}:`, err)
      continue
    }

    lessons.push({
      ...frontmatter,
      filePath: path.relative(CONTENT_DIR, filePath),
    })
  }

  lessons.sort((a, b) => a.grade - b.grade || a.chapter.localeCompare(b.chapter))
  _cache = lessons
  return _cache
}

export async function getLessonBySlug(
  slug: string,
): Promise<LessonWithContent | null> {
  const all = await getAllLessons()
  const meta = all.find((l) => l.slug === slug)
  if (!meta) return null

  const filePath = path.join(CONTENT_DIR, meta.filePath)
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { content } = matter(raw)

  return { ...meta, rawContent: content }
}

export async function getLessonsByGrade(grade: number): Promise<LessonMeta[]> {
  const all = await getAllLessons()
  return all.filter((l) => l.grade === grade)
}

export async function getChaptersByGrade(grade: number): Promise<string[]> {
  const lessons = await getLessonsByGrade(grade)
  const seen = new Set<string>()
  for (const l of lessons) seen.add(l.chapter)
  return [...seen]
}
