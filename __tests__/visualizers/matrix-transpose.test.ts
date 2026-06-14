import { describe, it, expect } from 'vitest'
import { generateMatrixTranspose } from '@/lib/visualizers/generators/matrix-transpose'

describe('generateMatrixTranspose', () => {
  it('throws on empty grid', () => {
    expect(() => generateMatrixTranspose({ grid: [] })).toThrow()
  })

  it('throws on ragged grid', () => {
    expect(() =>
      generateMatrixTranspose({ grid: [[1, 2, 3], [4, 5]] }),
    ).toThrow()
  })

  it('throws on dimensions larger than 6', () => {
    const big = Array.from({ length: 7 }, () => [1, 2, 3])
    expect(() => generateMatrixTranspose({ grid: big })).toThrow()
  })

  it('builds the transpose correctly for a 2×3 matrix', () => {
    const frames = generateMatrixTranspose({
      grid: [
        [1, 2, 3],
        [4, 5, 6],
      ],
    })
    const last = frames.at(-1)!
    expect(last.state.done).toBe(true)
    const result = last.state.transposed.map(row => row.map(c => c.value))
    expect(result).toEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ])
    // Every cell is filled at the end.
    expect(
      last.state.transposed.every(row => row.every(c => c.filled)),
    ).toBe(true)
  })

  it('emits one frame per source cell plus intro and done', () => {
    const frames = generateMatrixTranspose({
      grid: [
        [1, 2, 3],
        [4, 5, 6],
      ],
    })
    // intro + 6 cells + done
    expect(frames.length).toBe(8)
  })

  it('T[j][i] = grid[i][j] for an arbitrary matrix', () => {
    const grid = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
    ]
    const frames = generateMatrixTranspose({ grid })
    const result = frames
      .at(-1)!
      .state.transposed.map(row => row.map(c => c.value))
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[0].length; j++) {
        expect(result[j][i]).toBe(grid[i][j])
      }
    }
  })
})
