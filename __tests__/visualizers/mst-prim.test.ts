import { describe, it, expect } from 'vitest'
import { generateMstPrim } from '@/lib/visualizers/generators/mst-prim'
import type { Graph } from '@/lib/visualizers/generators/graph-types'

const G: Graph = {
  n: 5,
  directed: false,
  edges: [
    { from: 0, to: 1, weight: 2 },
    { from: 0, to: 3, weight: 6 },
    { from: 1, to: 2, weight: 3 },
    { from: 1, to: 3, weight: 8 },
    { from: 1, to: 4, weight: 5 },
    { from: 2, to: 4, weight: 7 },
    { from: 3, to: 4, weight: 9 },
  ],
}

describe('generateMstPrim', () => {
  it('computes the same MST weight as Kruskal (16)', () => {
    const last = generateMstPrim({ graph: G, start: 0 }).at(-1)!.state
    expect(last.done).toBe(true)
    expect(last.mstWeight).toBe(16)
  })

  it('adds every node to the tree', () => {
    const last = generateMstPrim({ graph: G, start: 0 }).at(-1)!.state
    expect(last.inTree.every(Boolean)).toBe(true)
  })

  it('weight is independent of start node', () => {
    for (let s = 0; s < G.n; s++) {
      const last = generateMstPrim({ graph: G, start: s }).at(-1)!.state
      expect(last.mstWeight).toBe(16)
    }
  })
})
