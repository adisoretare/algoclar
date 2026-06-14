import { describe, it, expect } from 'vitest'
import {
  generateSubmatrixSearch,
  type SubmatrixSearchState,
} from '@/lib/visualizers/generators/submatrix-search'

function lastState(grid: number[][], pattern: number[][]): SubmatrixSearchState {
  const frames = generateSubmatrixSearch({ grid, pattern })
  return frames[frames.length - 1].state
}

const GRID = [
  [1, 2, 3, 1, 2],
  [3, 1, 2, 3, 1],
  [1, 2, 3, 1, 2],
  [2, 3, 1, 2, 3],
]

describe('generateSubmatrixSearch', () => {
  it('finds all occurrences of a 2×2 pattern', () => {
    const pattern = [
      [1, 2],
      [3, 1],
    ]
    const state = lastState(GRID, pattern)
    expect(state.done).toBe(true)
    expect(state.found.map(p => `${p.r},${p.c}`)).toEqual(['0,0', '0,3'])
  })

  it('finds a single occurrence', () => {
    const pattern = [
      [2, 3],
      [1, 2],
    ]
    const state = lastState(GRID, pattern)
    // window (0,1): [[2,3],[1,2]] vs grid → 2,3 / 1,2 ✓
    expect(state.found).toContainEqual({ r: 0, c: 1 })
  })

  it('reports zero matches when the pattern is absent', () => {
    const pattern = [
      [9, 9],
      [9, 9],
    ]
    const state = lastState(GRID, pattern)
    expect(state.found).toEqual([])
  })

  it('emits a frame per anchor comparison and ends done', () => {
    const frames = generateSubmatrixSearch({
      grid: GRID,
      pattern: [
        [1, 2],
        [3, 1],
      ],
    })
    expect(frames.length).toBeGreaterThan(1)
    expect(frames.every(f => typeof f.explanation === 'string')).toBe(true)
    expect(frames[frames.length - 1].state.phase).toBe('done')
  })

  it('does not share the found array between frames (deep copy)', () => {
    const frames = generateSubmatrixSearch({
      grid: GRID,
      pattern: [
        [1, 2],
        [3, 1],
      ],
    })
    const refs = new Set(frames.map(f => f.state.found))
    expect(refs.size).toBe(frames.length)
  })

  it('throws when the pattern is larger than the grid', () => {
    expect(() =>
      generateSubmatrixSearch({
        grid: [[1, 2]],
        pattern: [
          [1, 2],
          [3, 4],
        ],
      }),
    ).toThrow()
  })

  it('throws on a ragged grid', () => {
    expect(() =>
      generateSubmatrixSearch({ grid: [[1, 2], [3]], pattern: [[1]] }),
    ).toThrow()
  })

  it('throws on a ragged pattern', () => {
    expect(() =>
      generateSubmatrixSearch({ grid: GRID, pattern: [[1, 2], [3]] }),
    ).toThrow()
  })

  it('throws on an empty grid', () => {
    expect(() =>
      generateSubmatrixSearch({ grid: [], pattern: [[1]] }),
    ).toThrow()
  })
})
