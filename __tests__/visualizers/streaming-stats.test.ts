import { describe, it, expect } from 'vitest'
import { generateStreamingStats } from '@/lib/visualizers/generators/streaming-stats'

describe('generateStreamingStats', () => {
  it('throws on empty array', () => {
    expect(() => generateStreamingStats({ array: [] })).toThrow()
  })

  it('accumulates sum, max and count over the array', () => {
    const array = [5, 2, 8, 1, 9, 4, 7, 3]
    const last = generateStreamingStats({ array }).at(-1)!.state
    expect(last.done).toBe(true)
    expect(last.sum).toBe(39)
    expect(last.maxValue).toBe(9)
    expect(last.count).toBe(array.length)
  })

  it('count equals number of elements seen so far at each step', () => {
    const frames = generateStreamingStats({ array: [10, 20, 30] })
    // frame i (0-based, non-summary) has count i+1
    expect(frames[0].state.count).toBe(1)
    expect(frames[1].state.count).toBe(2)
    expect(frames[2].state.count).toBe(3)
  })
})
