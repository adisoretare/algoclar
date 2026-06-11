import { describe, it, expect } from 'vitest'
import {
  generateFrequency,
  computeFrequency,
} from '@/lib/visualizers/generators/frequency'

describe('generateFrequency', () => {
  it('throws on empty array', () => {
    expect(() => generateFrequency({ array: [] })).toThrow()
  })

  it('throws on negative values', () => {
    expect(() => generateFrequency({ array: [1, -2] })).toThrow()
  })

  it('produces n + 1 frames (one per element + summary)', () => {
    const frames = generateFrequency({ array: [2, 0, 2, 1] })
    expect(frames).toHaveLength(5)
    expect(frames.at(-1)?.state.done).toBe(true)
  })

  it('final frequency counts every value', () => {
    const frames = generateFrequency({ array: [2, 0, 2, 1, 2] })
    expect([...frames.at(-1)!.state.freq]).toEqual([1, 1, 3])
  })

  it('freq grows monotonically and matches computeFrequency', () => {
    const array = [3, 1, 1, 0, 3]
    const frames = generateFrequency({ array })
    const { freq } = computeFrequency(array)
    expect([...frames.at(-1)!.state.freq]).toEqual(freq)
    // total counted equals array length
    const total = frames.at(-1)!.state.freq.reduce((a, b) => a + b, 0)
    expect(total).toBe(array.length)
  })

  it('every counting frame has a non-empty explanation', () => {
    const frames = generateFrequency({ array: [0, 1, 2] })
    expect(frames.every(f => f.explanation.length > 0)).toBe(true)
  })
})
