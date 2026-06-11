import { describe, it, expect } from 'vitest'
import { generateFloydWarshall } from '@/lib/visualizers/generators/floyd-warshall'
import type { Graph } from '@/lib/visualizers/generators/graph-types'

describe('generateFloydWarshall', () => {
  it('computes all-pairs shortest paths', () => {
    const g: Graph = {
      n: 4,
      directed: true,
      edges: [
        { from: 0, to: 1, weight: 3 },
        { from: 0, to: 3, weight: 7 },
        { from: 1, to: 0, weight: 8 },
        { from: 1, to: 2, weight: 2 },
        { from: 2, to: 0, weight: 5 },
        { from: 2, to: 3, weight: 1 },
        { from: 3, to: 0, weight: 2 },
      ],
    }
    const last = generateFloydWarshall({ graph: g }).at(-1)!.state
    expect(last.done).toBe(true)
    // verified by hand / reference
    expect(last.dist[0][2]).toBe(5) // 0->1->2
    expect(last.dist[1][3]).toBe(3) // 1->2->3
    expect(last.dist[2][1]).toBe(6) // 2->3->0->1
    expect(last.dist[3][2]).toBe(7) // 3->0->1->2
    expect(last.dist[0][3]).toBe(6) // 0->1->2->3
    expect(last.dist[0][0]).toBe(0)
  })

  it('leaves unreachable pairs as null', () => {
    const g: Graph = {
      n: 3,
      directed: true,
      edges: [{ from: 0, to: 1, weight: 1 }],
    }
    const last = generateFloydWarshall({ graph: g }).at(-1)!.state
    expect(last.dist[1][2]).toBeNull()
    expect(last.dist[0][1]).toBe(1)
  })
})
