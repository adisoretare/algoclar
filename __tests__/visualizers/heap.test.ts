import { describe, it, expect } from 'vitest'
import { generateHeap } from '@/lib/visualizers/generators/heap'

function isMinHeap(h: readonly number[]) {
  for (let i = 1; i < h.length; i++) {
    if (h[i] < h[(i - 1) >> 1]) return false
  }
  return true
}

describe('generateHeap', () => {
  it('throws on empty input', () => {
    expect(() => generateHeap({ values: [], extractCount: 0 })).toThrow()
  })

  it('is a valid min-heap after the insert phase and at the end', () => {
    // Intermediate sift frames legitimately break the invariant; check the
    // settled points: after all inserts, and the final frame.
    const frames = generateHeap({
      values: [5, 3, 8, 1, 9, 2, 7],
      extractCount: 3,
    })
    const afterInsert = frames.filter(f => f.state.phase === 'insert').at(-1)!.state
    expect(isMinHeap(afterInsert.heap)).toBe(true)
    expect(isMinHeap(frames.at(-1)!.state.heap)).toBe(true)
  })

  it('root is the global minimum after all inserts', () => {
    const values = [5, 3, 8, 1, 9, 2, 7]
    const frames = generateHeap({ values, extractCount: 0 })
    const afterInsert = frames.filter(f => f.state.phase === 'insert').at(-1)!.state
    expect(afterInsert.heap[0]).toBe(Math.min(...values))
  })

  it('extracts the smallest values in increasing order', () => {
    const values = [5, 3, 8, 1, 9, 2, 7]
    const frames = generateHeap({ values, extractCount: 4 })
    const removed = frames
      .filter(f => f.state.removed !== null)
      .map(f => f.state.removed)
    expect(removed).toEqual([1, 2, 3, 5])
  })
})
