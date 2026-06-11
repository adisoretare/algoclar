import { describe, it, expect } from 'vitest'
import { generateBacktracking } from '@/lib/visualizers/generators/backtracking'

function countSubsetsBrute(items: number[], target: number) {
  let count = 0
  const n = items.length
  for (let mask = 0; mask < 1 << n; mask++) {
    let s = 0
    for (let i = 0; i < n; i++) if (mask & (1 << i)) s += items[i]
    if (s === target) count++
  }
  return count
}

describe('generateBacktracking', () => {
  it('throws on empty or negative items', () => {
    expect(() => generateBacktracking({ items: [], target: 0 })).toThrow()
    expect(() => generateBacktracking({ items: [1, -2], target: 0 })).toThrow()
  })

  it('finds exactly the subsets that sum to target', () => {
    const items = [3, 1, 4, 2]
    const target = 5
    const frames = generateBacktracking({ items, target })
    const last = frames.at(-1)!.state
    expect(last.done).toBe(true)
    expect(last.solutions.length).toBe(countSubsetsBrute(items, target)) // {1,4},{3,2}
  })

  it('produces at least one prune frame when pruning is possible', () => {
    const frames = generateBacktracking({ items: [5, 6, 7], target: 1 })
    expect(frames.some(f => f.state.event === 'prune')).toBe(true)
  })

  it('never lets partial exceed target on a found leaf', () => {
    const frames = generateBacktracking({ items: [2, 3, 5, 1], target: 6 })
    for (const f of frames) {
      if (f.state.event === 'found' && !f.state.done)
        expect(f.state.partial).toBe(6)
    }
  })
})
