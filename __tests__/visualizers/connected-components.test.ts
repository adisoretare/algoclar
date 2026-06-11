import { describe, it, expect } from 'vitest'
import { generateConnectedComponents } from '@/lib/visualizers/generators/connected-components'
import type { Graph } from '@/lib/visualizers/generators/graph-types'

describe('generateConnectedComponents', () => {
  it('counts two components', () => {
    // {0,1,2} and {3,4}
    const g: Graph = {
      n: 5,
      directed: false,
      edges: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 3, to: 4 },
      ],
    }
    const last = generateConnectedComponents({ graph: g }).at(-1)!.state
    expect(last.done).toBe(true)
    expect(last.numComponents).toBe(2)
    expect(last.comp[0]).toBe(last.comp[2])
    expect(last.comp[3]).toBe(last.comp[4])
    expect(last.comp[0]).not.toBe(last.comp[3])
  })

  it('isolated nodes each form their own component', () => {
    const g: Graph = { n: 3, directed: false, edges: [] }
    const last = generateConnectedComponents({ graph: g }).at(-1)!.state
    expect(last.numComponents).toBe(3)
  })

  it('fully connected graph has one component', () => {
    const g: Graph = {
      n: 4,
      directed: false,
      edges: [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 3 },
      ],
    }
    const last = generateConnectedComponents({ graph: g }).at(-1)!.state
    expect(last.numComponents).toBe(1)
  })
})
