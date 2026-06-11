import { describe, it, expect } from 'vitest'
import { generateLeeFill } from '@/lib/visualizers/generators/lee-fill'

const OPEN = [
  [0, 0, 0],
  [0, 1, 0],
  [0, 0, 0],
]

describe('generateLeeFill', () => {
  it('throws when source is on a wall', () => {
    expect(() =>
      generateLeeFill({ grid: OPEN, source: [0, 0], target: [2, 2] }),
    ).not.toThrow()
    expect(() =>
      generateLeeFill({
        grid: [
          [1, 0],
          [0, 0],
        ],
        source: [0, 0],
        target: [1, 1],
      }),
    ).toThrow()
  })

  it('computes correct shortest distance around a wall', () => {
    const frames = generateLeeFill({ grid: OPEN, source: [0, 0], target: [2, 2] })
    const last = frames.at(-1)!.state
    expect(last.done).toBe(true)
    // Manhattan path around center wall = 4
    expect(last.dist[2][2]).toBe(4)
    expect(last.reachedTarget).toBe(true)
  })

  it('source distance is 0', () => {
    const frames = generateLeeFill({ grid: OPEN, source: [1, 0], target: [1, 2] })
    expect(frames[0].state.dist[1][0]).toBe(0)
  })

  it('reports unreachable target enclosed by walls', () => {
    const grid = [
      [0, 1, 0],
      [1, 1, 0],
      [0, 0, 0],
    ]
    const last = generateLeeFill({ grid, source: [0, 0], target: [2, 2] }).at(-1)!.state
    expect(last.dist[2][2]).toBeNull()
  })

  it('distances never decrease as the wavefront expands (BFS layering)', () => {
    const grid = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const frames = generateLeeFill({ grid, source: [0, 0], target: [1, 3] })
    const order = frames
      .map(f => f.state.current)
      .filter((c): c is readonly [number, number] => c !== null)
      .map(([r, c]) => frames.at(-1)!.state.dist[r][c] as number)
    for (let i = 1; i < order.length; i++) {
      expect(order[i]).toBeGreaterThanOrEqual(order[i - 1])
    }
  })
})
