import { describe, it, expect } from 'vitest'
import { generateRecursion } from '@/lib/visualizers/generators/recursion'

function fact(n: number): number {
  return n <= 1 ? 1 : n * fact(n - 1)
}

describe('generateRecursion', () => {
  it('throws outside 1..9', () => {
    expect(() => generateRecursion({ n: 0 })).toThrow()
    expect(() => generateRecursion({ n: 10 })).toThrow()
  })

  it('final result equals n!', () => {
    for (const n of [1, 3, 5, 8]) {
      const last = generateRecursion({ n }).at(-1)!.state
      expect(last.done).toBe(true)
      expect(last.result).toBe(fact(n))
    }
  })

  it('stack grows to n+1 frames then unwinds', () => {
    const n = 5
    const frames = generateRecursion({ n })
    const maxDepth = Math.max(...frames.map(f => f.state.stack.length))
    expect(maxDepth).toBe(n + 1) // factorial(n)..factorial(0)
  })

  it('base case sets ret = 1 for factorial(0)', () => {
    const frames = generateRecursion({ n: 4 })
    const base = frames.find(f => f.state.phase === 'base')!.state
    const top = base.stack.at(-1)!
    expect(top.n).toBe(0)
  })
})
