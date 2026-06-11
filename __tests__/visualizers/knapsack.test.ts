import { describe, it, expect } from 'vitest'
import { generateKnapsack } from '@/lib/visualizers/generators/knapsack'
import type { KnapsackItem } from '@/lib/visualizers/generators/knapsack'

function bruteKnapsack(items: KnapsackItem[], cap: number) {
  let best = 0
  const n = items.length
  for (let mask = 0; mask < 1 << n; mask++) {
    let w = 0
    let v = 0
    for (let i = 0; i < n; i++)
      if (mask & (1 << i)) {
        w += items[i].w
        v += items[i].v
      }
    if (w <= cap) best = Math.max(best, v)
  }
  return best
}

describe('generateKnapsack', () => {
  it('throws on empty items or bad capacity', () => {
    expect(() => generateKnapsack({ items: [], capacity: 5 })).toThrow()
    expect(() => generateKnapsack({ items: [{ w: 1, v: 1 }], capacity: 0 })).toThrow()
  })

  it('finds the classic optimum', () => {
    const items = [
      { w: 1, v: 1 },
      { w: 3, v: 4 },
      { w: 4, v: 5 },
      { w: 5, v: 7 },
    ]
    const last = generateKnapsack({ items, capacity: 7 }).at(-1)!.state
    expect(last.done).toBe(true)
    expect(last.result).toBe(9) // items 2+4 (w=3+5=8>7? no) -> w3v4 + w4v5 = w7 v9
  })

  it('matches brute force across cases', () => {
    const cases: { items: KnapsackItem[]; cap: number }[] = [
      { items: [{ w: 2, v: 3 }, { w: 3, v: 4 }, { w: 4, v: 5 }], cap: 5 },
      { items: [{ w: 1, v: 1 }, { w: 1, v: 1 }, { w: 1, v: 1 }], cap: 2 },
      { items: [{ w: 6, v: 30 }, { w: 3, v: 14 }, { w: 4, v: 16 }], cap: 10 },
    ]
    for (const { items, cap } of cases) {
      const last = generateKnapsack({ items, capacity: cap }).at(-1)!.state
      expect(last.result).toBe(bruteKnapsack(items, cap))
    }
  })
})
