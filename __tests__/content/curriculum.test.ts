import { describe, it, expect } from 'vitest'
import {
  CURRICULUM,
  LEVELS,
  RECOMMENDED_ORDER,
  getGradeById,
  getGradeByNumber,
  getGradeData,
  gradeNumbers,
  gradeSubtitle,
  gradeIdFromNumber,
} from '@/data/curriculum'

describe('CURRICULUM shape', () => {
  it('has exactly 8 curriculum entries', () => {
    expect(CURRICULUM.length).toBe(8)
  })

  it('contains expected grade IDs in order', () => {
    const ids = CURRICULUM.map((g) => g.id)
    expect(ids).toEqual(['5', '6', '7', '8', 'baraj-gimnaziu', '9', '10', '11-12'])
  })

  it('each grade has at least 1 chapter', () => {
    for (const g of CURRICULUM) {
      expect(g.chapters.length).toBeGreaterThan(0)
    }
  })

  it('chapter order values are unique within each grade', () => {
    for (const g of CURRICULUM) {
      const orders = g.chapters.map((c) => c.order)
      expect(new Set(orders).size).toBe(orders.length)
    }
  })

  it('each chapter has at least 1 lesson', () => {
    for (const g of CURRICULUM) {
      for (const c of g.chapters) {
        expect(c.lessons.length).toBeGreaterThan(0)
      }
    }
  })

  it('all lesson ids within a grade are unique', () => {
    for (const g of CURRICULUM) {
      const ids = g.chapters.flatMap((c) => c.lessons.map((l) => l.id))
      expect(new Set(ids).size).toBe(ids.length)
    }
  })
})

describe('isBridge flag', () => {
  it('grade 5 fundamente chapter has bridge lessons', () => {
    const g = getGradeById('5')!
    const ch = g.chapters.find((c) => c.id === 'fundamente')!
    const bridges = ch.lessons.filter((l) => l.isBridge)
    expect(bridges.length).toBeGreaterThan(0)
  })

  it('bridge lessons have titles starting with Lecție-punte', () => {
    for (const g of CURRICULUM) {
      for (const ch of g.chapters) {
        for (const l of ch.lessons) {
          if (l.isBridge) {
            expect(l.title).toMatch(/^Lecție-punte/)
          }
        }
      }
    }
  })
})

describe('isNationalExtension flag', () => {
  it('grade 5 vectori chapter is national extension', () => {
    const g = getGradeById('5')!
    const ch = g.chapters.find((c) => c.id === 'vectori')!
    expect(ch.isNationalExtension).toBe(true)
  })

  it('grade 11-12 grafuri-avansate chapter is national extension', () => {
    const g = getGradeById('11-12')!
    const ch = g.chapters.find((c) => c.id === 'grafuri-avansate')!
    expect(ch.isNationalExtension).toBe(true)
  })

  it('grade 5 fundamente chapter is NOT national extension', () => {
    const g = getGradeById('5')!
    const ch = g.chapters.find((c) => c.id === 'fundamente')!
    expect(ch.isNationalExtension).toBeFalsy()
  })
})

describe('isBaraj flag', () => {
  it('baraj-gimnaziu grade has a chapter with isBaraj', () => {
    const g = getGradeById('baraj-gimnaziu')!
    const barajChapters = g.chapters.filter((c) => c.isBaraj)
    expect(barajChapters.length).toBeGreaterThan(0)
  })
})

describe('visualizer field', () => {
  it('bubble-sort lesson in grade 5 vectori chapter has visualizer', () => {
    const g = getGradeById('5')!
    const ch = g.chapters.find((c) => c.id === 'vectori')!
    const bs = ch.lessons.find((l) => l.id === 'bubble-sort-5')
    expect(bs?.visualizer).toBe('bubble-sort')
  })

  it('parcurgerea-unui-vector lesson has array-traversal visualizer', () => {
    const g = getGradeById('5')!
    const ch = g.chapters.find((c) => c.id === 'vectori')!
    const lesson = ch.lessons.find((l) => l.id === 'parcurgerea-unui-vector')
    expect(lesson?.visualizer).toBe('array-traversal')
  })
})

describe('LEVELS', () => {
  it('has exactly 7 levels', () => {
    expect(LEVELS.length).toBe(7)
  })

  it('level ids are 1..7', () => {
    expect(LEVELS.map((l) => l.id)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('each level has a non-empty title and topics', () => {
    for (const level of LEVELS) {
      expect(level.title.length).toBeGreaterThan(0)
      expect(level.topics.length).toBeGreaterThan(0)
    }
  })
})

describe('RECOMMENDED_ORDER', () => {
  it('has exactly 25 entries', () => {
    expect(RECOMMENDED_ORDER.length).toBe(25)
  })
})

describe('helpers', () => {
  it('getGradeById returns correct grade', () => {
    expect(getGradeById('5')?.label).toBe('Clasa a V-a')
    expect(getGradeById('11-12')?.label).toBe('Clasele XI–XII')
    expect(getGradeById('baraj-gimnaziu')?.label).toBe('Baraj gimnaziu')
    expect(getGradeById('99')).toBeUndefined()
  })

  it('getGradeByNumber handles standard grades', () => {
    expect(getGradeByNumber(5)?.id).toBe('5')
    expect(getGradeByNumber(9)?.id).toBe('9')
    expect(getGradeByNumber(10)?.id).toBe('10')
  })

  it('getGradeByNumber maps 11 and 12 to 11-12', () => {
    expect(getGradeByNumber(11)?.id).toBe('11-12')
    expect(getGradeByNumber(12)?.id).toBe('11-12')
  })

  it('getGradeByNumber returns undefined for out-of-range', () => {
    expect(getGradeByNumber(4)).toBeUndefined()
    expect(getGradeByNumber(13)).toBeUndefined()
  })

  it('getGradeData is alias for getGradeByNumber', () => {
    expect(getGradeData(9)).toBe(getGradeByNumber(9))
  })

  it('gradeNumbers returns correct arrays', () => {
    expect(gradeNumbers('5')).toEqual([5])
    expect(gradeNumbers('10')).toEqual([10])
    expect(gradeNumbers('11-12')).toEqual([11, 12])
    expect(gradeNumbers('baraj-gimnaziu')).toEqual([])
  })

  it('gradeSubtitle returns correct strings', () => {
    expect(gradeSubtitle('5')).toBe('Clasa 5')
    expect(gradeSubtitle('10')).toBe('Clasa 10')
    expect(gradeSubtitle('11-12')).toBe('XI–XII')
    expect(gradeSubtitle('baraj-gimnaziu')).toBe('Baraj')
  })

  it('gradeIdFromNumber maps correctly', () => {
    expect(gradeIdFromNumber(5)).toBe('5')
    expect(gradeIdFromNumber(11)).toBe('11-12')
    expect(gradeIdFromNumber(12)).toBe('11-12')
  })
})
