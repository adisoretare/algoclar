import { describe, it, expect } from 'vitest'
import { generateTopologicalSort } from '@/lib/visualizers/generators/topological-sort'
import type { Graph } from '@/lib/visualizers/generators/graph-types'

describe('generateTopologicalSort', () => {
  it('produces a valid order (every edge points forward)', () => {
    const g: Graph = {
      n: 6,
      directed: true,
      edges: [
        { from: 5, to: 2 },
        { from: 5, to: 0 },
        { from: 4, to: 0 },
        { from: 4, to: 1 },
        { from: 2, to: 3 },
        { from: 3, to: 1 },
      ],
    }
    const last = generateTopologicalSort({ graph: g }).at(-1)!.state
    expect(last.done).toBe(true)
    expect(last.hasCycle).toBe(false)
    expect(last.order.length).toBe(g.n)
    const pos = new Map(last.order.map((node, i) => [node, i]))
    for (const e of g.edges) {
      expect(pos.get(e.from)!).toBeLessThan(pos.get(e.to)!)
    }
  })

  it('detects a cycle', () => {
    const g: Graph = {
      n: 3,
      directed: true,
      edges: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 0 },
      ],
    }
    const last = generateTopologicalSort({ graph: g }).at(-1)!.state
    expect(last.hasCycle).toBe(true)
    expect(last.order.length).toBeLessThan(g.n)
  })
})
