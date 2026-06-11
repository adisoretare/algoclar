import { describe, it, expect } from 'vitest'
import { generateAccesVector } from '@/lib/visualizers/generators/acces-vector'

describe('generateAccesVector', () => {
  it('throws on empty array', () => {
    expect(() => generateAccesVector({ array: [] })).toThrow()
  })

  it('accesses distinct, non-sequential indices then ends with a summary', () => {
    const array = [5, 3, 8, 1, 9, 2, 7] // n = 7
    const frames = generateAccesVector({ array })
    const accesses = frames.filter(f => !f.state.done)
    const indices = accesses.map(f => f.state.accessIndex)
    // candidates [0, 6, 3, 1, 5] are all valid & distinct for n=7
    expect(indices).toEqual([0, 6, 3, 1, 5])
    // each access reports the value at that index
    for (const f of accesses) {
      expect(f.state.accessValue).toBe(array[f.state.accessIndex])
    }
  })

  it('final frame is a summary with accessIndex -1', () => {
    const last = generateAccesVector({ array: [5, 3, 8, 1, 9, 2, 7] }).at(-1)!.state
    expect(last.done).toBe(true)
    expect(last.accessIndex).toBe(-1)
  })

  it('dedupes indices for small arrays', () => {
    const indices = generateAccesVector({ array: [1, 2] })
      .filter(f => !f.state.done)
      .map(f => f.state.accessIndex)
    expect(new Set(indices).size).toBe(indices.length)
    expect(indices.every(i => i >= 0 && i < 2)).toBe(true)
  })
})
