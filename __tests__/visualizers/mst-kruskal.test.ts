import { describe, it, expect } from 'vitest'
import { generateMstKruskal } from '@/lib/visualizers/generators/mst-kruskal'
import type { Graph } from '@/lib/visualizers/generators/graph-types'

// classic MST example, known total weight 16
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

describe('generateMstKruskal', () => {
  it('computes correct MST weight', () => {
    const last = generateMstKruskal({ graph: G }).at(-1)!.state
    expect(last.done).toBe(true)
    expect(last.mstWeight).toBe(16) // 2 + 3 + 5 + 6
  })

  it('chooses exactly n-1 edges', () => {
    const last = generateMstKruskal({ graph: G }).at(-1)!.state
    const chosenCount = last.chosen.filter(Boolean).length
    expect(chosenCount).toBe(G.n - 1)
  })

  it('rejects a cycle-forming edge encountered before completion', () => {
    // triangle 0-1-2 all cheap, then a heavier bridge to 3: the 3rd-cheapest
    // edge closes the triangle and must be rejected before the MST finishes.
    const tri: Graph = {
      n: 4,
      directed: false,
      edges: [
        { from: 0, to: 1, weight: 1 },
        { from: 1, to: 2, weight: 1 },
        { from: 0, to: 2, weight: 1 },
        { from: 2, to: 3, weight: 5 },
      ],
    }
    const frames = generateMstKruskal({ graph: tri })
    expect(frames.some(f => f.state.accepted === false)).toBe(true)
    expect(frames.at(-1)!.state.mstWeight).toBe(7) // 1 + 1 + 5
  })
})
