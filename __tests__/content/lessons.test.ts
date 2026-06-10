import { describe, it, expect } from 'vitest'
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
