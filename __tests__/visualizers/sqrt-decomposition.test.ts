import { describe, it, expect } from 'vitest'
import { generateSqrtDecomposition } from '@/lib/visualizers/generators/sqrt-decomposition'

const A = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8]

function rangeSum(arr: number[], l: number, r: number) {
  return arr.slice(l, r + 1).reduce((a, b) => a + b, 0)
}

describe('generateSqrtDecomposition', () => {
  it('throws on invalid range', () => {
    expect(() => generateSqrtDecomposition({ array: A, l: 5, r: 2 })).toThrow()
  })

  it('range query equals the direct sum', () => {
    const cases: [number, number][] = [
      [0, 11],
      [2, 9],
      [4, 4],
      [1, 10],
      [3, 7],
    ]
    for (const [l, r] of cases) {
      const last = generateSqrtDecomposition({ array: A, l, r }).at(-1)!.state
      expect(last.result).toBe(rangeSum(A, l, r))
    }
  })

  it('uses whole blocks for a wide range', () => {
    const last = generateSqrtDecomposition({ array: A, l: 0, r: 11 }).at(-1)!.state
    expect(last.coveredBlocks.length).toBeGreaterThan(0)
    expect(last.done).toBe(true)
  })
})
