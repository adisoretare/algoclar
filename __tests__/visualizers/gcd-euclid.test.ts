import { describe, it, expect } from 'vitest'
import { generateGcdEuclid } from '@/lib/visualizers/generators/gcd-euclid'

function finalGcd(a: number, b: number): number {
  const frames = generateGcdEuclid({ a, b })
  const last = frames.at(-1)!.state
  return last.gcd
}

describe('generateGcdEuclid', () => {
  it('computes CMMDC(48, 18) = 6', () => {
    expect(finalGcd(48, 18)).toBe(6)
  })

  it('computes CMMDC(1071, 462) = 21', () => {
    expect(finalGcd(1071, 462)).toBe(21)
  })

  it('computes CMMDC(17, 5) = 1 (coprime)', () => {
    expect(finalGcd(17, 5)).toBe(1)
  })

  it('computes CMMDC(7, 7) = 7 (equal values, one iteration)', () => {
    const frames = generateGcdEuclid({ a: 7, b: 7 })
    const last = frames.at(-1)!.state
    expect(last.gcd).toBe(7)
    expect(last.history.length).toBe(1)
    expect(last.history[0]).toEqual({ a: 7, b: 7, r: 0 })
  })

  it('computes CMMDC(1, 1) = 1 (smallest valid input)', () => {
    expect(finalGcd(1, 1)).toBe(1)
  })

  it('throws on non-positive input (0, 5)', () => {
    expect(() => generateGcdEuclid({ a: 0, b: 5 })).toThrow()
  })

  it('throws when a value exceeds 1.000.000', () => {
    expect(() => generateGcdEuclid({ a: 1_000_001, b: 5 })).toThrow()
  })

  it('final frame is marked done with b = 0', () => {
    const last = generateGcdEuclid({ a: 48, b: 18 }).at(-1)!.state
    expect(last.done).toBe(true)
    expect(last.b).toBe(0)
  })

  it('records one history row per iteration', () => {
    const last = generateGcdEuclid({ a: 48, b: 18 }).at(-1)!.state
    // 48,18 -> 18,12 -> 12,6 -> 6,0 : three modulo iterations
    expect(last.history.length).toBe(3)
    expect(last.history[0]).toEqual({ a: 48, b: 18, r: 12 })
  })
})
