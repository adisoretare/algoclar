import { describe, it, expect } from 'vitest'
import { generateDouaMaxime } from '@/lib/visualizers/generators/doua-maxime'

describe('generateDouaMaxime', () => {
  it('throws on empty array', () => {
    expect(() => generateDouaMaxime({ array: [] })).toThrow()
  })

  it('finds the two largest distinct values', () => {
    const last = generateDouaMaxime({ array: [3, 7, 5, 2, 9, 4] }).at(-1)!.state
    expect(last.done).toBe(true)
    expect(last.max1).toBe(9)
    expect(last.max2).toBe(7)
  })

  it('demotes old max1 to max2 when a new larger value arrives', () => {
    const last = generateDouaMaxime({ array: [1, 2, 3, 4, 5] }).at(-1)!.state
    expect(last.max1).toBe(5)
    expect(last.max2).toBe(4)
  })

  it('leaves max2 unset (index -1) when all values are equal', () => {
    const last = generateDouaMaxime({ array: [5, 5, 5] }).at(-1)!.state
    expect(last.max1).toBe(5)
    expect(last.max2Index).toBe(-1)
  })
})
