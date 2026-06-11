import { describe, it, expect } from 'vitest'
import { generateSccKosaraju } from '@/lib/visualizers/generators/scc-kosaraju'
import type { Graph } from '@/lib/visualizers/generators/graph-types'

describe('generateSccKosaraju', () => {
  it('throws on undirected graph', () => {
    expect(() =>
      generateSccKosaraju({ graph: { n: 2, directed: false, edges: [] } }),
    ).toThrow()
  })

  it('finds strongly connected components', () => {
    // 0->1->2->0 (one SCC) and 3->4 (two singletons)
    const g: Graph = {
      n: 5,
      directed: true,
      edges: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 0 },
        { from: 2, to: 3 },
        { from: 3, to: 4 },
      ],
    }
    const last = generateSccKosaraju({ graph: g }).at(-1)!.state
    expect(last.done).toBe(true)
    expect(last.numSccs).toBe(3)
    // 0,1,2 share an SCC
    expect(last.comp[0]).toBe(last.comp[1])
    expect(last.comp[1]).toBe(last.comp[2])
    expect(last.comp[3]).not.toBe(last.comp[0])
    expect(last.comp[4]).not.toBe(last.comp[3])
  })

  it('every node receives an SCC id', () => {
    const g: Graph = {
      n: 3,
      directed: true,
      edges: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
      ],
    }
    const last = generateSccKosaraju({ graph: g }).at(-1)!.state
    expect(last.comp.every(c => c !== null)).toBe(true)
    expect(last.numSccs).toBe(3)
  })
})
