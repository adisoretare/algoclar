import { describe, it, expect } from 'vitest'
import { generatePrefixSums2D } from '@/lib/visualizers/generators/prefix-sums-2d'

const GRID = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
]

function rectSum(
  grid: number[][],
  r1: number,
  c1: number,
  r2: number,
  c2: number,
) {
  let s = 0
  for (let i = r1; i <= r2; i++) for (let j = c1; j <= c2; j++) s += grid[i][j]
  return s
}

describe('generatePrefixSums2D', () => {
  it('throws on empty grid', () => {
    expect(() =>
      generatePrefixSums2D({ grid: [], query: { r1: 0, c1: 0, r2: 0, c2: 0 } }),
    ).toThrow()
  })

  it('throws on ragged grid', () => {
    expect(() =>
      generatePrefixSums2D({
        grid: [[1, 2], [3]],
        query: { r1: 0, c1: 0, r2: 1, c2: 0 },
      }),
    ).toThrow()
  })

  it('throws on invalid rectangle', () => {
    expect(() =>
      generatePrefixSums2D({ grid: GRID, query: { r1: 0, c1: 0, r2: 3, c2: 0 } }),
    ).toThrow()
  })

  it('builds the full prefix table correctly', () => {
    const frames = generatePrefixSums2D({
      grid: GRID,
      query: { r1: 0, c1: 0, r2: 2, c2: 2 },
    })
    const last = frames.at(-1)!
    // bottom-right of prefix = sum of whole grid = 45
    expect(last.state.prefix[3][3]).toBe(45)
  })

  it('rectangle query matches the brute-force sum', () => {
    const cases = [
      { r1: 0, c1: 0, r2: 1, c2: 1 },
      { r1: 1, c1: 1, r2: 2, c2: 2 },
      { r1: 0, c1: 2, r2: 2, c2: 2 },
      { r1: 1, c1: 0, r2: 1, c2: 2 },
    ]
    for (const q of cases) {
      const frames = generatePrefixSums2D({ grid: GRID, query: q })
      const last = frames.at(-1)!
      expect(last.state.done).toBe(true)
      expect(last.state.result).toBe(rectSum(GRID, q.r1, q.c1, q.r2, q.c2))
    }
  })
})
