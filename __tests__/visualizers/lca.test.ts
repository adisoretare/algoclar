import { describe, it, expect } from 'vitest'
import { generateLca } from '@/lib/visualizers/generators/lca'

//        0
//       / \
//      1   2
//     / \   \
//    3   4   5
//        |
//        6
const PARENT = [0, 0, 0, 1, 1, 2, 4]
const ROOT = 0

describe('generateLca', () => {
  it('finds LCA of two deep nodes', () => {
    const last = generateLca({ parent: PARENT, root: ROOT, u: 6, v: 3 }).at(-1)!.state
    expect(last.done).toBe(true)
    expect(last.lca).toBe(1)
  })

  it('LCA across subtrees is the root', () => {
    const last = generateLca({ parent: PARENT, root: ROOT, u: 3, v: 5 }).at(-1)!.state
    expect(last.lca).toBe(0)
  })

  it('LCA of a node and its ancestor is the ancestor', () => {
    const last = generateLca({ parent: PARENT, root: ROOT, u: 6, v: 1 }).at(-1)!.state
    expect(last.lca).toBe(1)
  })

  it('computes depths correctly', () => {
    const last = generateLca({ parent: PARENT, root: ROOT, u: 6, v: 5 }).at(-1)!.state
    expect(last.depth[6]).toBe(3)
    expect(last.depth[0]).toBe(0)
    expect(last.lca).toBe(0)
  })
})
