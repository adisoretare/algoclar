import { describe, it, expect } from 'vitest'
import {
  generateMatrixTraversal,
  type MatrixTraversalMode,
} from '@/lib/visualizers/generators/matrix-traversal'

// 3×4 grid with distinct values so the visit order is unambiguous.
//   1  2  3  4
//   5  6  7  8
//   9 10 11 12
const GRID = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
]

/** The output sequence equals the last frame's running output. */
function outputOf(mode: MatrixTraversalMode): number[] {
  const frames = generateMatrixTraversal({ grid: GRID, mode })
  const last = frames.at(-1)!
  expect(last.state.done).toBe(true)
  return [...last.state.output]
}

/** The sequence of `current` cells across frames (skipping the intro frame). */
function currentValuesOf(mode: MatrixTraversalMode): number[] {
  const frames = generateMatrixTraversal({ grid: GRID, mode })
  return frames
    .filter(f => f.state.current !== null)
    .map(f => {
      const { r, c } = f.state.current!
      return f.state.grid[r][c]
    })
}

describe('generateMatrixTraversal', () => {
  it('throws on empty grid', () => {
    expect(() =>
      generateMatrixTraversal({ grid: [], mode: 'linii' }),
    ).toThrow()
  })

  it('throws on ragged grid', () => {
    expect(() =>
      generateMatrixTraversal({ grid: [[1, 2], [3]], mode: 'linii' }),
    ).toThrow()
  })

  it('linii: row-major order', () => {
    const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    expect(outputOf('linii')).toEqual(expected)
    expect(currentValuesOf('linii')).toEqual(expected)
  })

  it('coloane: column-major order', () => {
    const expected = [1, 5, 9, 2, 6, 10, 3, 7, 11, 4, 8, 12]
    expect(outputOf('coloane')).toEqual(expected)
    expect(currentValuesOf('coloane')).toEqual(expected)
  })

  it('diagonale: secondary diagonals by (r+c) ascending', () => {
    // (r+c)=0: 1
    // (r+c)=1: 2,5
    // (r+c)=2: 3,6,9
    // (r+c)=3: 4,7,10
    // (r+c)=4: 8,11
    // (r+c)=5: 12
    const expected = [1, 2, 5, 3, 6, 9, 4, 7, 10, 8, 11, 12]
    expect(outputOf('diagonale')).toEqual(expected)
    expect(currentValuesOf('diagonale')).toEqual(expected)
  })

  it('spirala: clockwise shrinking spiral', () => {
    // top L→R: 1 2 3 4
    // right T→B: 8 12
    // bottom R→L: 11 10 9
    // left B→T: 5
    // inner top L→R: 6 7
    const expected = [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]
    expect(outputOf('spirala')).toEqual(expected)
    expect(currentValuesOf('spirala')).toEqual(expected)
  })

  it('handles a 1×1 grid in every mode (single visit, marked done)', () => {
    for (const mode of ['linii', 'coloane', 'diagonale', 'spirala'] as const) {
      const frames = generateMatrixTraversal({ grid: [[42]], mode })
      // intro frame + one visit frame
      expect(frames).toHaveLength(2)
      const last = frames.at(-1)!.state
      expect(last.done).toBe(true)
      expect([...last.output]).toEqual([42])
    }
  })

  it('every mode visits all cells exactly once', () => {
    const all = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].sort((a, b) => a - b)
    for (const mode of ['linii', 'coloane', 'diagonale', 'spirala'] as const) {
      const out = outputOf(mode)
      expect(out.length).toBe(12)
      expect([...out].sort((a, b) => a - b)).toEqual(all)
    }
  })
})
