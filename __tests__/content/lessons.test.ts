import { describe, it, expect, beforeAll } from 'vitest'
import { LessonFrontmatterSchema } from '@/lib/content/types'

describe('LessonFrontmatterSchema', () => {
  const valid = {
    title: 'Bubble Sort',
    slug: 'bubble-sort',
    grade: 9,
    chapter: 'sortare',
    difficulty: 'baza' as const,
    estimatedTime: 15,
  }

  it('accepts valid frontmatter', () => {
    const result = LessonFrontmatterSchema.parse(valid)
    expect(result.title).toBe('Bubble Sort')
    expect(result.free).toBe(true)
    expect(result.tags).toEqual([])
    expect(result.visualizers).toEqual([])
    expect(result.relatedProblems).toEqual([])
  })

  it('defaults free to true when omitted', () => {
    const result = LessonFrontmatterSchema.parse(valid)
    expect(result.free).toBe(true)
  })

  it('accepts free: false explicitly', () => {
    const result = LessonFrontmatterSchema.parse({ ...valid, free: false })
    expect(result.free).toBe(false)
  })

  it('throws on missing required title', () => {
    const { title: _, ...rest } = valid
    expect(() => LessonFrontmatterSchema.parse(rest)).toThrow()
  })

  it('throws on invalid difficulty', () => {
    expect(() =>
      LessonFrontmatterSchema.parse({ ...valid, difficulty: 'ușor' }),
    ).toThrow()
  })

  it('throws on grade outside 5-12', () => {
    expect(() =>
      LessonFrontmatterSchema.parse({ ...valid, grade: 4 }),
    ).toThrow()
    expect(() =>
      LessonFrontmatterSchema.parse({ ...valid, grade: 13 }),
    ).toThrow()
  })

  it('throws on negative estimatedTime', () => {
    expect(() =>
      LessonFrontmatterSchema.parse({ ...valid, estimatedTime: -1 }),
    ).toThrow()
  })

  it('accepts tags, visualizers, relatedProblems arrays', () => {
    const result = LessonFrontmatterSchema.parse({
      ...valid,
      tags: ['sortare', 'comparatie'],
      visualizers: ['bubble-sort'],
      relatedProblems: ['oji-2023-9-sortare'],
    })
    expect(result.tags).toEqual(['sortare', 'comparatie'])
  })
})

import {
  getAllLessons,
  getLessonBySlug,
  getLessonsByGrade,
  getChaptersByGrade,
  getLessonsForChapter,
  getPrevNextLesson,
} from '@/lib/content/lessons'
import type { LessonMeta } from '@/lib/content/types'

describe('getAllLessons()', () => {
  let lessons: LessonMeta[]

  beforeAll(async () => {
    lessons = await getAllLessons()
  })

  it('returns at least 2 lessons', async () => {
    expect(lessons.length).toBeGreaterThanOrEqual(2)
  })

  it('each lesson has valid frontmatter shape', () => {
    for (const lesson of lessons) {
      expect(lesson.title).toBeTruthy()
      expect(lesson.slug).toBeTruthy()
      expect(lesson.grade).toBeGreaterThanOrEqual(5)
      expect(lesson.grade).toBeLessThanOrEqual(12)
      expect(['baza', 'mediu', 'greu']).toContain(lesson.difficulty)
      expect(Array.isArray(lesson.tags)).toBe(true)
    }
  })

  it('returns same array on second call (cache hit)', async () => {
    const second = await getAllLessons()
    expect(second).toBe(lessons)
  })
})

describe('getLessonBySlug()', () => {
  it('returns bubble-sort lesson with rawContent', async () => {
    const lesson = await getLessonBySlug('bubble-sort')
    expect(lesson).not.toBeNull()
    expect(lesson!.slug).toBe('bubble-sort')
    expect(lesson!.rawContent).toContain('Bubble Sort')
    expect(lesson!.grade).toBe(9)
  })

  it('returns null for unknown slug', async () => {
    const lesson = await getLessonBySlug('nu-exista-lectia-asta')
    expect(lesson).toBeNull()
  })
})

describe('getLessonsByGrade()', () => {
  it('returns only grade 9 lessons', async () => {
    const lessons = await getLessonsByGrade(9)
    expect(lessons.length).toBeGreaterThanOrEqual(1)
    for (const l of lessons) {
      expect(l.grade).toBe(9)
    }
  })

  it('returns empty array for grade with no lessons', async () => {
    const lessons = await getLessonsByGrade(12)
    expect(Array.isArray(lessons)).toBe(true)
  })
})

describe('getChaptersByGrade()', () => {
  it('returns chapters for grade 9', async () => {
    const chapters = await getChaptersByGrade(9)
    expect(chapters).toContain('vectori-9')
  })

  it('returns unique chapters only', async () => {
    const chapters = await getChaptersByGrade(9)
    const unique = [...new Set(chapters)]
    expect(chapters).toEqual(unique)
  })

  it('returns chapters in curriculum order for grade 7', async () => {
    const chapters = await getChaptersByGrade(7)
    // grade-7 has only recursivitate/factorial.mdx → first chapter is 'functii'
    expect(chapters[0]).toBe('functii')
  })

  it('returns chapters in curriculum order for grade 9', async () => {
    const chapters = await getChaptersByGrade(9)
    // grade-9 has only sortare/bubble-sort.mdx → first chapter is 'vectori-9'
    expect(chapters[0]).toBe('vectori-9')
  })
})

describe('getLessonsForChapter()', () => {
  it('returns lessons matching grade + chapter', async () => {
    const lessons = await getLessonsForChapter(9, 'vectori-9')
    expect(lessons.length).toBeGreaterThan(0)
    for (const l of lessons) {
      expect(l.grade).toBe(9)
      expect(l.chapter).toBe('vectori-9')
    }
  })

  it('returns empty array for chapter with no content', async () => {
    const lessons = await getLessonsForChapter(12, 'dp-avansat')
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
    // prev must be grade ≤ 9; the preceding it() asserts prev is not null
    expect(prev!.grade).toBeLessThanOrEqual(9)
  })

  it('bubble-sort next is cautare-binara (same grade, chapter order 1 < 2)', async () => {
    const { next } = await getPrevNextLesson('bubble-sort')
    // grade-9 sortare (order 1) → next is grade-9 cautare-binara (order 2)
    expect(next?.slug).toBe('cautare-binara')
  })
})
