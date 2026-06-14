import { describe, it, expect } from 'vitest'
import { generateDirectionVectors } from '@/lib/visualizers/generators/direction-vectors'

describe('generateDirectionVectors', () => {
  it('corner cell on a 4×5 grid with connectivity 4 → 2 valid (down, right), 2 out of bounds', () => {
    const frames = generateDirectionVectors({
      rows: 4,
      cols: 5,
      cell: { r: 0, c: 0 },
      connectivity: 4,
    })
    const last = frames.at(-1)!
    const { neighbors } = last.state
    expect(neighbors).toHaveLength(4)

    const valid = neighbors.filter(n => n.valid)
    const invalid = neighbors.filter(n => !n.valid)
    expect(valid).toHaveLength(2)
    expect(invalid).toHaveLength(2)

    // The two valid ones must be down (1,0)→(1,0) and right (0,1)→(0,1).
    const down = neighbors.find(n => n.dr === 1 && n.dc === 0)!
    const right = neighbors.find(n => n.dr === 0 && n.dc === 1)!
    expect(down.valid).toBe(true)
    expect(down.nr).toBe(1)
    expect(down.nc).toBe(0)
    expect(right.valid).toBe(true)
    expect(right.nr).toBe(0)
    expect(right.nc).toBe(1)

    // Up and left fall outside.
    const up = neighbors.find(n => n.dr === -1 && n.dc === 0)!
    const left = neighbors.find(n => n.dr === 0 && n.dc === -1)!
    expect(up.valid).toBe(false)
    expect(left.valid).toBe(false)
  })

  it('interior cell {1,2} on a 4×5 grid with connectivity 8 → all 8 valid', () => {
    const frames = generateDirectionVectors({
      rows: 4,
      cols: 5,
      cell: { r: 1, c: 2 },
      connectivity: 8,
    })
    const last = frames.at(-1)!
    const { neighbors } = last.state
    expect(neighbors).toHaveLength(8)
    expect(neighbors.every(n => n.valid)).toBe(true)
    expect(last.state.done).toBe(true)
  })

  it('throws when the cell is outside the grid', () => {
    expect(() =>
      generateDirectionVectors({
        rows: 4,
        cols: 5,
        cell: { r: 4, c: 0 },
        connectivity: 4,
      }),
    ).toThrow()
  })

  it('throws on invalid connectivity', () => {
    expect(() =>
      generateDirectionVectors({
        rows: 4,
        cols: 5,
        cell: { r: 0, c: 0 },
        // @ts-expect-error testing runtime guard with invalid connectivity
        connectivity: 5,
      }),
    ).toThrow()
  })

  it('throws on out-of-range dimensions', () => {
    expect(() =>
      generateDirectionVectors({
        rows: 9,
        cols: 5,
        cell: { r: 0, c: 0 },
        connectivity: 4,
      }),
    ).toThrow()
  })
})
