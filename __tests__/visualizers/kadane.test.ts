import { describe, it, expect } from 'vitest'
import { generateKadane } from '@/lib/visualizers/generators/kadane'

function bruteMaxSubarray(a: number[]) {
  let best = -Infinity
  let bestStart = 0
  let bestEnd = 0
  for (let i = 0; i < a.length; i++) {
    let sum = 0
    for (let j = i; j < a.length; j++) {
      sum += a[j]
      if (sum > best) {
        best = sum
        bestStart = i
        bestEnd = j
      }
    }
  }
  return { best, bestStart, bestEnd }
}

describe('generateKadane', () => {
  it('throws on empty array', () => {
    expect(() => generateKadane({ array: [] })).toThrow()
  })

  it('produces n + 1 frames (one per element + summary)', () => {
    const frames = generateKadane({ array: [1, -2, 3, 4] })
    expect(frames).toHaveLength(5)
    expect(frames.at(-1)?.state.done).toBe(true)
  })

  it('matches brute force on a classic mixed array', () => {
    const array = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
    const frames = generateKadane({ array })
    const last = frames.at(-1)!.state
    const brute = bruteMaxSubarray(array)
    expect(last.best).toBe(brute.best) // 6
    expect(last.bestStart).toBe(brute.bestStart)
    expect(last.bestEnd).toBe(brute.bestEnd)
  })

  it('handles an all-negative array (picks the largest element)', () => {
    const array = [-5, -2, -8, -1, -9]
    const frames = generateKadane({ array })
    const last = frames.at(-1)!.state
    expect(last.best).toBe(-1)
    expect(last.bestStart).toBe(3)
    expect(last.bestEnd).toBe(3)
  })

  it('handles an all-positive array (whole array)', () => {
    const array = [2, 3, 1, 5]
    const last = generateKadane({ array }).at(-1)!.state
    expect(last.best).toBe(11)
    expect(last.bestStart).toBe(0)
    expect(last.bestEnd).toBe(3)
  })

  it('current sum equals the sum of the running subarray at every step', () => {
    const array = [4, -1, -2, 6, -3, 5]
    const frames = generateKadane({ array }).filter(f => !f.state.done)
    for (const f of frames) {
      const { curStart, index, current } = f.state
      const actual = array.slice(curStart, index + 1).reduce((a, b) => a + b, 0)
      expect(current).toBe(actual)
    }
  })

  it('best always matches brute force across random-ish cases', () => {
    const cases = [
      [1],
      [0, 0, 0],
      [5, -3, 5],
      [-1, 2, 3, -9, 4, 5, -2],
      [3, -2, -2, 3],
      [10, -1, -1, -1, -1, 11],
    ]
    for (const array of cases) {
      const last = generateKadane({ array }).at(-1)!.state
      expect(last.best).toBe(bruteMaxSubarray(array).best)
    }
  })
})
