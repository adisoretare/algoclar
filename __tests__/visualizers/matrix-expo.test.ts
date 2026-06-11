import { describe, it, expect } from 'vitest'
import { generateMatrixExpo } from '@/lib/visualizers/generators/matrix-expo'

function fib(k: number): number {
  let a = 0
  let b = 1
  for (let i = 0; i < k; i++) [a, b] = [b, a + b]
  return a
}

describe('generateMatrixExpo', () => {
  it('throws outside 1..40', () => {
    expect(() => generateMatrixExpo({ exponent: 0 })).toThrow()
    expect(() => generateMatrixExpo({ exponent: 41 })).toThrow()
  })

  it('M^p [0][1] equals Fib(p)', () => {
    for (const p of [1, 5, 10, 20, 30]) {
      const last = generateMatrixExpo({ exponent: p }).at(-1)!.state
      expect(last.result[0][1]).toBe(fib(p))
    }
  })

  it('uses O(log p) steps', () => {
    const last = generateMatrixExpo({ exponent: 32 }).at(-1)!.state
    expect(last.step).toBeLessThanOrEqual(6) // log2(32) = 5, plus shift to 0
    expect(last.done).toBe(true)
  })
})
