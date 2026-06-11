import { describe, it, expect } from 'vitest'
import { generateGraphBfs } from '@/lib/visualizers/generators/graph-bfs'
import type { Graph } from '@/lib/visualizers/generators/graph-types'

// 0-1-2, 0-3, 3-4 (undirected)
const G: Graph = {
  n: 5,
  directed: false,
  edges: [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 0, to: 3 },
    { from: 3, to: 4 },
  ],
}

describe('generateGraphBfs', () => {
  it('throws on bad source', () => {
    expect(() => generateGraphBfs({ graph: G, source: 9 })).toThrow()
  })

  it('computes correct BFS distances', () => {
    const last = generateGraphBfs({ graph: G, source: 0 }).at(-1)!.state
    expect(last.done).toBe(true)
    expect([...last.dist]).toEqual([0, 1, 2, 1, 2])
    expect(last.visited.every(Boolean)).toBe(true)
  })

  it('source has distance 0', () => {
    const frames = generateGraphBfs({ graph: G, source: 2 })
    expect(frames[0].state.dist[2]).toBe(0)
  })
})
