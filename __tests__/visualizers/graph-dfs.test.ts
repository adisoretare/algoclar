import { describe, it, expect } from 'vitest'
import { generateGraphDfs } from '@/lib/visualizers/generators/graph-dfs'
import type { Graph } from '@/lib/visualizers/generators/graph-types'

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

describe('generateGraphDfs', () => {
  it('assigns nested [tin, tout] intervals', () => {
    const last = generateGraphDfs({ graph: G, source: 0 }).at(-1)!.state
    expect(last.done).toBe(true)
    for (let u = 0; u < G.n; u++) {
      expect(last.tin[u]).not.toBeNull()
      expect(last.tout[u]).not.toBeNull()
      expect(last.tin[u]!).toBeLessThan(last.tout[u]!)
    }
  })

  it('uses 2n distinct timestamps', () => {
    const last = generateGraphDfs({ graph: G, source: 0 }).at(-1)!.state
    const times = [...last.tin, ...last.tout] as number[]
    expect(new Set(times).size).toBe(2 * G.n)
    expect(Math.min(...times)).toBe(0)
    expect(Math.max(...times)).toBe(2 * G.n - 1)
  })

  it('ancestor interval contains descendant interval', () => {
    // 0 is ancestor of 2 (0-1-2)
    const last = generateGraphDfs({ graph: G, source: 0 }).at(-1)!.state
    expect(last.tin[0]!).toBeLessThan(last.tin[2]!)
    expect(last.tout[2]!).toBeLessThan(last.tout[0]!)
  })
})
