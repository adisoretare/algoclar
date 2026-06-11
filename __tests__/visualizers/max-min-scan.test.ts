import { describe, it, expect } from 'vitest'
import { generateMaxMinScan } from '@/lib/visualizers/generators/max-min-scan'

describe('generateMaxMinScan', () => {
  it('throws on empty array', () => {
    expect(() => generateMaxMinScan({ array: [] })).toThrow()
  })

  it('produces n + 1 frames (one per element + summary)', () => {
    const array = [4, 7, 2, 9, 1, 5, 8, 3]
    const frames = generateMaxMinScan({ array })
    expect(frames.length).toBe(array.length + 1)
  })

  it('final frame holds max and min with their indices', () => {
    const array = [4, 7, 2, 9, 1, 5, 8, 3]
    const last = generateMaxMinScan({ array }).at(-1)!.state
    expect(last.done).toBe(true)
    expect(last.currentIndex).toBe(-1)
    expect(last.maxValue).toBe(9)
    expect(last.maxIndex).toBe(3)
    expect(last.minValue).toBe(1)
    expect(last.minIndex).toBe(4)
  })

  it('works with all-negative values', () => {
    const last = generateMaxMinScan({ array: [-5, -3, -8, -1] }).at(-1)!.state
    expect(last.maxValue).toBe(-1)
    expect(last.minValue).toBe(-8)
  })
})
