import { describe, it, expect } from 'vitest'
import { generateMatrixBorder } from '@/lib/visualizers/generators/matrix-border'

describe('generateMatrixBorder', () => {
  it('throws on empty grid', () => {
    expect(() => generateMatrixBorder({ grid: [], fill: 0 })).toThrow()
  })

  it('throws on ragged grid', () => {
    expect(() =>
      generateMatrixBorder({ grid: [[1, 2], [3]], fill: 0 }),
    ).toThrow()
  })

  it('throws on dimensions over 6', () => {
    const big = Array.from({ length: 7 }, () => [1, 2, 3])
    expect(() => generateMatrixBorder({ grid: big, fill: 0 })).toThrow()
  })

  it('builds the bordered matrix for [[1,2],[3,4]] fill=0', () => {
    const frames = generateMatrixBorder({ grid: [[1, 2], [3, 4]], fill: 0 })
    const last = frames.at(-1)!
    expect(last.state.done).toBe(true)
    expect(last.state.bordered).toEqual([
      [0, 0, 0, 0],
      [0, 1, 2, 0],
      [0, 3, 4, 0],
      [0, 0, 0, 0],
    ])
  })

  it('uses a custom fill value for the border', () => {
    const frames = generateMatrixBorder({ grid: [[5]], fill: -1 })
    const last = frames.at(-1)!
    expect(last.state.bordered).toEqual([
      [-1, -1, -1],
      [-1, 5, -1],
      [-1, -1, -1],
    ])
  })

  it('first frame is the intro with nothing placed', () => {
    const frames = generateMatrixBorder({ grid: [[1, 2], [3, 4]], fill: 0 })
    const first = frames[0]
    expect(first.state.phase).toBe('intro')
    expect(
      first.state.kinds.every(row => row.every(k => k === 'empty')),
    ).toBe(true)
  })

  it('classifies every cell as border or interior by the end', () => {
    const frames = generateMatrixBorder({
      grid: [[1, 2, 3], [4, 5, 6]],
      fill: 0,
    })
    const last = frames.at(-1)!
    const rows = last.state.kinds.length
    const cols = last.state.kinds[0].length
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const onEdge = i === 0 || j === 0 || i === rows - 1 || j === cols - 1
        expect(last.state.kinds[i][j]).toBe(onEdge ? 'border' : 'interior')
      }
    }
  })
})
