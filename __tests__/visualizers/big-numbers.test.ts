import { describe, it, expect } from 'vitest'
import { generateBigNumbers } from '@/lib/visualizers/generators/big-numbers'

function digits(n: bigint): number[] {
  return n.toString().split('').map(Number)
}

describe('generateBigNumbers', () => {
  it('throws on empty or invalid digits', () => {
    expect(() => generateBigNumbers({ a: [], b: [1] })).toThrow()
    expect(() => generateBigNumbers({ a: [10], b: [1] })).toThrow()
  })

  it('adds two numbers with carries correctly', () => {
    const a = digits(BigInt('99999'))
    const b = digits(BigInt('1'))
    const last = generateBigNumbers({ a, b }).at(-1)!.state
    expect(last.result.join('')).toBe('100000')
  })

  it('matches bigint addition for several cases', () => {
    const cases: [bigint, bigint][] = [
      [BigInt('123'), BigInt('456')],
      [BigInt('999'), BigInt('999')],
      [BigInt('12345678901234567890'), BigInt('98765432109876543210')],
      [BigInt('5'), BigInt('7')],
      [BigInt('1000'), BigInt('1')],
    ]
    for (const [x, y] of cases) {
      const last = generateBigNumbers({ a: digits(x), b: digits(y) }).at(-1)!.state
      expect(last.result.join('')).toBe((x + y).toString())
    }
  })

  it('emits one column frame per digit position', () => {
    const frames = generateBigNumbers({ a: [1, 2, 3], b: [4, 5] })
    const cols = frames.filter(f => f.state.pos >= 0 && f.state.pos < 3)
    expect(cols.length).toBeGreaterThanOrEqual(3)
  })
})
