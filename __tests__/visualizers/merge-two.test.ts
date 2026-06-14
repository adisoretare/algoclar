import { describe, it, expect } from 'vitest'
import { generateMergeTwo } from '@/lib/visualizers/generators/merge-two'

function isSortedAscending(arr: readonly number[]): boolean {
  for (let k = 1; k < arr.length; k++) {
    if (arr[k] < arr[k - 1]) return false
  }
  return true
}

describe('generateMergeTwo', () => {
  it('merges [1,4,5,8] and [2,3,6,7] into [1,2,3,4,5,6,7,8]', () => {
    const frames = generateMergeTwo({ a: [1, 4, 5, 8], b: [2, 3, 6, 7] })
    const last = frames.at(-1)!
    expect(last.state.done).toBe(true)
    expect([...last.state.result]).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('produces a sorted result', () => {
    const frames = generateMergeTwo({ a: [1, 4, 5, 8], b: [2, 3, 6, 7] })
    const last = frames.at(-1)!
    expect(isSortedAscending(last.state.result)).toBe(true)
  })

  it('records which side was taken on each merge step', () => {
    const frames = generateMergeTwo({ a: [1, 4, 5, 8], b: [2, 3, 6, 7] })
    // First taken value is 1 from A.
    const firstTake = frames.find(f => f.state.result.length === 1)!
    expect(firstTake.state.taken).toBe('a')
    expect([...firstTake.state.result]).toEqual([1])
  })

  it('drains the leftover of the longer array', () => {
    const frames = generateMergeTwo({ a: [1, 2, 3], b: [10] })
    const last = frames.at(-1)!
    expect([...last.state.result]).toEqual([1, 2, 3, 10])
  })

  it('throws when an input is not sorted ascending', () => {
    expect(() => generateMergeTwo({ a: [4, 1, 5], b: [2, 3] })).toThrow()
    expect(() => generateMergeTwo({ a: [1, 2], b: [9, 3] })).toThrow()
  })

  it('throws when an input is empty', () => {
    expect(() => generateMergeTwo({ a: [], b: [1, 2] })).toThrow()
    expect(() => generateMergeTwo({ a: [1, 2], b: [] })).toThrow()
  })

  it('throws when the combined length exceeds 24', () => {
    const big = Array.from({ length: 13 }, (_, k) => k)
    expect(() => generateMergeTwo({ a: big, b: big })).toThrow()
  })
})
