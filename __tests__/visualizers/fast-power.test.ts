import { describe, it, expect } from 'vitest'
import { generateFastPower } from '@/lib/visualizers/generators/fast-power'

function finalResult(base: number, exp: number, mod?: number): number {
  const frames = generateFastPower({ base, exp, mod })
  const last = frames.at(-1)!
  expect(last.state.done).toBe(true)
  return last.state.result
}

function bigIntModPow(base: bigint, exp: bigint, mod: bigint): bigint {
  const ZERO = BigInt(0)
  const ONE = BigInt(1)
  let result = ONE % mod
  let b = base % mod
  let e = exp
  while (e > ZERO) {
    if (e & ONE) result = (result * b) % mod
    b = (b * b) % mod
    e >>= ONE
  }
  return result
}

describe('generateFastPower', () => {
  it('matches Math.pow without modulo', () => {
    const cases: [number, number][] = [
      [2, 10],
      [3, 13],
      [5, 0],
      [0, 5],
      [1, 30],
      [7, 7],
      [10, 9],
      [2, 0],
      [13, 4],
    ]
    for (const [base, exp] of cases) {
      expect(finalResult(base, exp)).toBe(Math.pow(base, exp))
    }
  })

  it('any base to the power 0 is 1', () => {
    expect(finalResult(0, 0)).toBe(1)
    expect(finalResult(123, 0)).toBe(1)
  })

  it('matches BigInt reference for modulo cases', () => {
    const cases: [number, number, number][] = [
      [3, 13, 7],
      [2, 30, 1_000_000_000],
      [7, 20, 13],
      [1000, 25, 1_000_000_000],
      [999, 18, 100_000],
      [2, 10, 1],
      [5, 0, 17],
    ]
    for (const [base, exp, mod] of cases) {
      const expected = Number(
        bigIntModPow(BigInt(base), BigInt(exp), BigInt(mod)),
      )
      expect(finalResult(base, exp, mod)).toBe(expected)
    }
  })

  it('throws on negative exponent', () => {
    expect(() => generateFastPower({ base: 2, exp: -1 })).toThrow()
  })

  it('throws on out-of-range inputs', () => {
    expect(() => generateFastPower({ base: 2, exp: 31 })).toThrow()
    expect(() => generateFastPower({ base: -1, exp: 2 })).toThrow()
    expect(() => generateFastPower({ base: 2000, exp: 2 })).toThrow()
    expect(() => generateFastPower({ base: 2, exp: 2, mod: -5 })).toThrow()
    expect(() => generateFastPower({ base: 2, exp: 2, mod: 2_000_000_000 })).toThrow()
    expect(() => generateFastPower({ base: 2, exp: 2, mod: 1_000_000_007 })).toThrow()
  })

  it('throws when result overflows the safe range without modulo', () => {
    expect(() => generateFastPower({ base: 1000, exp: 30 })).toThrow()
  })

  it('shows the exponent in binary up front', () => {
    const frames = generateFastPower({ base: 3, exp: 13 })
    expect(frames[0].state.bits.join('')).toBe((13).toString(2))
    expect(frames[0].state.activeBit).toBe(-1)
  })

  it('emits one processing frame per exponent bit plus init and done', () => {
    const exp = 13 // 1101 -> 4 bits
    const frames = generateFastPower({ base: 3, exp })
    const bitCount = exp.toString(2).length
    // 1 init + bitCount processing + 1 done
    expect(frames.length).toBe(1 + bitCount + 1)
  })

  it('handles a single-bit exponent (exp = 1): init + 1 step + done', () => {
    const frames = generateFastPower({ base: 7, exp: 1 })
    expect(frames).toHaveLength(3)
    expect(frames[0].state.bits.join('')).toBe('1')
    const last = frames.at(-1)!.state
    expect(last.done).toBe(true)
    expect(last.result).toBe(7)
  })

  it('deep-copies state per frame (bits array not shared)', () => {
    const frames = generateFastPower({ base: 3, exp: 5 })
    expect(frames[0].state.bits).not.toBe(frames[1].state.bits)
  })
})
