import { describe, it, expect } from 'vitest'
import { generateDsu } from '@/lib/visualizers/generators/dsu'

function root(parent: readonly number[], x: number): number {
  while (parent[x] !== x) x = parent[x]
  return x
}

describe('generateDsu', () => {
  it('throws on n < 1', () => {
    expect(() => generateDsu({ n: 0, operations: [] })).toThrow()
  })

  it('unions merge sets', () => {
    const last = generateDsu({
      n: 5,
      operations: [
        { type: 'union', a: 0, b: 1 },
        { type: 'union', a: 0, b: 2 },
        { type: 'union', a: 3, b: 4 },
      ],
    }).at(-1)!.state
    expect(root(last.parent, 0)).toBe(root(last.parent, 2))
    expect(root(last.parent, 3)).toBe(root(last.parent, 4))
    expect(root(last.parent, 0)).not.toBe(root(last.parent, 3))
  })

  it('find compresses the path (node points near root afterwards)', () => {
    const frames = generateDsu({
      n: 5,
      operations: [
        { type: 'union', a: 0, b: 1 },
        { type: 'union', a: 0, b: 2 },
        { type: 'union', a: 3, b: 4 },
        { type: 'union', a: 0, b: 3 },
        { type: 'find', a: 4 },
      ],
    })
    const last = frames.at(-1)!.state
    // after compression, parent[4] should be the root directly
    expect(last.parent[4]).toBe(root(last.parent, 4))
  })

  it('union of already-connected nodes does nothing', () => {
    const frames = generateDsu({
      n: 3,
      operations: [
        { type: 'union', a: 0, b: 1 },
        { type: 'union', a: 0, b: 1 },
      ],
    })
    const noop = frames.find(f => f.state.merged === false)
    expect(noop).toBeTruthy()
  })
})
