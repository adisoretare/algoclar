import { describe, it, expect } from 'vitest'
import { generateLinearSearch } from '@/lib/visualizers/generators/linear-search'

describe('generateLinearSearch', () => {
  it('throws on empty array', () => {
    expect(() => generateLinearSearch({ array: [], target: 1 })).toThrow()
  })

  it('throws on more than 20 values', () => {
    const array = Array.from({ length: 21 }, (_, k) => k)
    expect(() => generateLinearSearch({ array, target: 1 })).toThrow()
  })

  it('finds 9 in [5,3,8,1,9,2,7] at index 4', () => {
    const array = [5, 3, 8, 1, 9, 2, 7]
    const frames = generateLinearSearch({ array, target: 9 })
    const last = frames.at(-1)!.state
    expect(last.done).toBe(true)
    expect(last.found).toBe(true)
    expect(last.foundIndex).toBe(4)
    expect(last.i).toBe(4)
    // 5 comparisons: indices 0,1,2,3,4
    expect(last.comparisons).toBe(5)
  })

  it('ends not-found when value is absent', () => {
    const array = [5, 3, 8, 1, 9, 2, 7]
    const frames = generateLinearSearch({ array, target: 99 })
    const last = frames.at(-1)!.state
    expect(last.done).toBe(true)
    expect(last.found).toBe(false)
    expect(last.foundIndex).toBe(-1)
    expect(last.i).toBe(-1)
    // scans entire array => 7 comparisons
    expect(last.comparisons).toBe(7)
  })

  it('counts comparisons correctly when found at the first index', () => {
    const frames = generateLinearSearch({ array: [5, 3, 8], target: 5 })
    expect(frames).toHaveLength(1)
    expect(frames[0].state.comparisons).toBe(1)
    expect(frames[0].state.foundIndex).toBe(0)
  })

  it('handles a single-element array (found and not-found)', () => {
    const hit = generateLinearSearch({ array: [7], target: 7 })
    expect(hit).toHaveLength(1)
    expect(hit[0].state.done).toBe(true)
    expect(hit[0].state.found).toBe(true)
    expect(hit[0].state.foundIndex).toBe(0)

    const miss = generateLinearSearch({ array: [7], target: 3 })
    const last = miss.at(-1)!.state
    expect(last.done).toBe(true)
    expect(last.found).toBe(false)
    expect(last.comparisons).toBe(1)
  })

  it('produces Romanian explanations', () => {
    const frames = generateLinearSearch({ array: [5, 3, 8, 1, 9, 2, 7], target: 9 })
    expect(frames[0].explanation).toBe('v[0]=5 ≠ 9, continuăm')
    expect(frames.at(-1)!.explanation).toBe('v[4]=9 = 9, găsit la indexul 4')
  })
})
