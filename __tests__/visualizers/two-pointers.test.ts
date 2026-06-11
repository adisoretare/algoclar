import { describe, it, expect } from 'vitest'
import { generateTwoPointers } from '@/lib/visualizers/generators/two-pointers'

describe('generateTwoPointers', () => {
  it('throws when fewer than 2 values', () => {
    expect(() => generateTwoPointers({ array: [1], target: 2 })).toThrow()
  })

  it('sorts the array before searching', () => {
    const frames = generateTwoPointers({ array: [9, 1, 5, 3], target: 100 })
    expect([...frames[0].state.array]).toEqual([1, 3, 5, 9])
  })

  it('finds an existing pair', () => {
    const frames = generateTwoPointers({ array: [2, 7, 11, 15], target: 9 })
    const last = frames.at(-1)!
    expect(last.state.found).toBe(true)
    expect(last.state.done).toBe(true)
    const { array, l, r } = last.state
    expect(array[l] + array[r]).toBe(9)
  })

  it('reports not found when no pair sums to target', () => {
    const frames = generateTwoPointers({ array: [1, 2, 3, 4], target: 100 })
    const last = frames.at(-1)!
    expect(last.state.notFound).toBe(true)
    expect(last.state.found).toBe(false)
  })

  it('keeps l < r and converges (monotone pointers)', () => {
    const frames = generateTwoPointers({ array: [1, 3, 4, 6, 8, 10], target: 13 })
    for (const f of frames) expect(f.state.l).toBeLessThanOrEqual(f.state.r)
  })
})
