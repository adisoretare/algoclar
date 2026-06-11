import { describe, it, expect } from 'vitest'
import { generateSlidingWindow } from '@/lib/visualizers/generators/sliding-window'

function bruteBest(array: number[], k: number) {
  let best = -Infinity
  for (let i = 0; i + k <= array.length; i++) {
    best = Math.max(best, array.slice(i, i + k).reduce((a, b) => a + b, 0))
  }
  return best
}

describe('generateSlidingWindow', () => {
  it('throws on empty array', () => {
    expect(() => generateSlidingWindow({ array: [], k: 1 })).toThrow()
  })

  it('throws on k out of range', () => {
    expect(() => generateSlidingWindow({ array: [1, 2], k: 0 })).toThrow()
    expect(() => generateSlidingWindow({ array: [1, 2], k: 3 })).toThrow()
  })

  it('first frame sums the initial window directly', () => {
    const frames = generateSlidingWindow({ array: [1, 2, 3, 4], k: 2 })
    expect(frames[0].state.windowSum).toBe(3)
    expect(frames[0].state.start).toBe(0)
    expect(frames[0].state.end).toBe(1)
  })

  it('best sum matches brute force', () => {
    const array = [2, 1, 5, 1, 3, 2]
    const frames = generateSlidingWindow({ array, k: 3 })
    expect(frames.at(-1)!.state.bestSum).toBe(bruteBest(array, 3))
  })

  it('windowSum stays consistent with the window contents', () => {
    const array = [4, 2, 7, 1, 9, 3]
    const k = 3
    const frames = generateSlidingWindow({ array, k })
    for (const f of frames) {
      const { start, end } = f.state
      const actual = array.slice(start, end + 1).reduce((a, b) => a + b, 0)
      expect(f.state.windowSum).toBe(actual)
    }
  })

  it('k === n yields a single window', () => {
    const frames = generateSlidingWindow({ array: [3, 4, 5], k: 3 })
    expect(frames[0].state.done).toBe(true)
    expect(frames.at(-1)!.state.bestSum).toBe(12)
  })
})
