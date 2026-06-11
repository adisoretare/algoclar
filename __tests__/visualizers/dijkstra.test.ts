import { describe, it, expect } from 'vitest'
import { generateDijkstra } from '@/lib/visualizers/generators/dijkstra'
import type { Graph } from '@/lib/visualizers/generators/graph-types'

const G: Graph = {
  n: 5,
  directed: true,
  edges: [
    { from: 0, to: 1, weight: 4 },
    { from: 0, to: 2, weight: 1 },
    { from: 2, to: 1, weight: 2 },
    { from: 1, to: 3, weight: 1 },
    { from: 2, to: 3, weight: 5 },
    { from: 3, to: 4, weight: 3 },
  ],
}

describe('generateDijkstra', () => {
  it('throws on negative weight', () => {
    expect(() =>
      generateDijkstra({
        graph: { n: 2, directed: true, edges: [{ from: 0, to: 1, weight: -1 }] },
        source: 0,
      }),
    ).toThrow()
  })

  it('computes correct shortest distances', () => {
    const last = generateDijkstra({ graph: G, source: 0 }).at(-1)!.state
    expect(last.done).toBe(true)
    // 0->2(1)->1(3)->3(4)->4(7)
    expect([...last.dist]).toEqual([0, 3, 1, 4, 7])
  })

  it('marks all reachable nodes visited', () => {
    const last = generateDijkstra({ graph: G, source: 0 }).at(-1)!.state
    expect(last.visited.every(Boolean)).toBe(true)
  })
})
