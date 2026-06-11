import { describe, it, expect } from 'vitest'
import { generateLinkedList } from '@/lib/visualizers/generators/linked-list'

describe('generateLinkedList', () => {
  it('throws on fewer than 3 values', () => {
    expect(() => generateLinkedList({ values: [1, 2] })).toThrow()
  })

  it('build phase appends every value', () => {
    const frames = generateLinkedList({ values: [1, 2, 3, 4] })
    const built = frames.filter(f => f.state.phase === 'build').at(-1)!.state
    expect(built.nodes).toEqual([1, 2, 3, 4])
  })

  it('deletes the middle node and keeps the rest in order', () => {
    const values = [10, 20, 30, 40, 50]
    const frames = generateLinkedList({ values })
    const last = frames.at(-1)!.state
    expect(last.done).toBe(true)
    // middle index = floor(5/2) = 2 -> value 30 removed
    expect(last.nodes).toEqual([10, 20, 40, 50])
  })

  it('traverse phase visits every node once in order', () => {
    const frames = generateLinkedList({ values: [7, 8, 9] })
    const visited = frames
      .filter(f => f.state.phase === 'traverse')
      .map(f => f.state.highlight)
    expect(visited).toEqual([0, 1, 2])
  })
})
