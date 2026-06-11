import { describe, it, expect } from 'vitest'
import { generateSegmentTree } from '@/lib/visualizers/generators/segment-tree'

const A = [3, 1, 4, 1, 5, 9, 2, 6]

function rangeSum(arr: number[], l: number, r: number) {
  return arr.slice(l, r + 1).reduce((a, b) => a + b, 0)
}

describe('generateSegmentTree', () => {
  it('throws on invalid range', () => {
    expect(() => generateSegmentTree({ array: A, l: 3, r: 1 })).toThrow()
  })

  it('range query equals the direct sum', () => {
    const cases: [number, number][] = [
      [0, 7],
      [2, 5],
      [1, 1],
      [3, 6],
      [0, 3],
    ]
    for (const [l, r] of cases) {
      const last = generateSegmentTree({ array: A, l, r }).at(-1)!.state
      expect(last.result).toBe(rangeSum(A, l, r))
    }
  })

  it('root holds the total sum after build', () => {
    const frames = generateSegmentTree({ array: A, l: 0, r: 7 })
    const built = frames.filter(f => f.state.phase === 'build').at(-1)!.state
    expect(built.tree[1]).toBe(rangeSum(A, 0, 7))
  })

  it('covers a range with O(log n) nodes', () => {
    const last = generateSegmentTree({ array: A, l: 1, r: 6 }).at(-1)!.state
    expect(last.coverNodes.length).toBeLessThanOrEqual(4)
  })
})
