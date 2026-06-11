import { describe, it, expect } from 'vitest'
import { generateFenwick } from '@/lib/visualizers/generators/fenwick-tree'

const A = [3, 1, 4, 1, 5, 9, 2, 6]

function prefix(arr: number[], k: number) {
  return arr.slice(0, k).reduce((a, b) => a + b, 0)
}

describe('generateFenwick', () => {
  it('throws on invalid prefix', () => {
    expect(() => generateFenwick({ array: A, queryPrefix: 0 })).toThrow()
    expect(() => generateFenwick({ array: A, queryPrefix: 99 })).toThrow()
  })

  it('prefix query equals the direct prefix sum', () => {
    for (const k of [1, 3, 5, 8]) {
      const last = generateFenwick({ array: A, queryPrefix: k }).at(-1)!.state
      expect(last.accumulated).toBe(prefix(A, k))
    }
  })

  it('query visits O(log n) indices', () => {
    const last = generateFenwick({ array: A, queryPrefix: 7 }).at(-1)!.state
    expect(last.touched.length).toBeLessThanOrEqual(3) // log2(8) = 3
    expect(last.done).toBe(true)
  })
})
