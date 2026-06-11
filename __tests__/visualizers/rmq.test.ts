import { describe, it, expect } from 'vitest'
import { generateRmq } from '@/lib/visualizers/generators/rmq'

const A = [5, 2, 8, 1, 9, 3, 7, 4]

function rangeMin(arr: number[], l: number, r: number) {
  return Math.min(...arr.slice(l, r + 1))
}

describe('generateRmq', () => {
  it('throws on invalid range', () => {
    expect(() => generateRmq({ array: A, l: 5, r: 2 })).toThrow()
  })

  it('range minimum equals brute force', () => {
    const cases: [number, number][] = [
      [0, 7],
      [1, 4],
      [3, 3],
      [2, 6],
      [5, 7],
    ]
    for (const [l, r] of cases) {
      const last = generateRmq({ array: A, l, r }).at(-1)!.state
      expect(last.result).toBe(rangeMin(A, l, r))
    }
  })

  it('uses exactly two table cells for the query', () => {
    const last = generateRmq({ array: A, l: 1, r: 6 }).at(-1)!.state
    expect(last.queryCells.length).toBe(2)
    expect(last.done).toBe(true)
  })
})
