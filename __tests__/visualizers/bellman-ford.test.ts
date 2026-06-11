import { describe, it, expect } from 'vitest'
import { generateBellmanFord } from '@/lib/visualizers/generators/bellman-ford'
import type { Graph } from '@/lib/visualizers/generators/graph-types'

describe('generateBellmanFord', () => {
  it('handles negative edges correctly', () => {
    const g: Graph = {
      n: 5,
      directed: true,
      edges: [
        { from: 0, to: 1, weight: 6 },
        { from: 0, to: 2, weight: 7 },
        { from: 1, to: 3, weight: 5 },
        { from: 1, to: 2, weight: 8 },
        { from: 1, to: 4, weight: -4 },
        { from: 2, to: 3, weight: -3 },
        { from: 2, to: 4, weight: 9 },
        { from: 3, to: 1, weight: -2 },
        { from: 4, to: 3, weight: 7 },
        { from: 4, to: 0, weight: 2 },
      ],
    }
    const last = generateBellmanFord({ graph: g, source: 0 }).at(-1)!.state
    expect(last.done).toBe(true)
    expect(last.negativeCycle).toBe(false)
    expect([...last.dist]).toEqual([0, 2, 7, 4, -2])
  })

  it('detects a negative cycle', () => {
    const g: Graph = {
      n: 3,
      directed: true,
      edges: [
        { from: 0, to: 1, weight: 1 },
        { from: 1, to: 2, weight: -3 },
        { from: 2, to: 0, weight: 1 },
      ],
    }
    const last = generateBellmanFord({ graph: g, source: 0 }).at(-1)!.state
    expect(last.negativeCycle).toBe(true)
  })
})
