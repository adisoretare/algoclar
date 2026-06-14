import { describe, it, expect } from 'vitest'
import { generateModularClock } from '@/lib/visualizers/generators/modular-clock'

function lastResult(input: Parameters<typeof generateModularClock>[0]) {
  const frames = generateModularClock(input)
  return frames.at(-1)!.state
}

describe('generateModularClock', () => {
  it('rest: 17 mod 12 = 5', () => {
    const last = lastResult({ a: 17, b: 0, m: 12, op: 'rest' })
    expect(last.done).toBe(true)
    expect(last.result).toBe(5)
  })

  it('adunare: (7 + 5) mod 12 = 0', () => {
    const last = lastResult({ a: 7, b: 5, m: 12, op: 'adunare' })
    expect(last.done).toBe(true)
    expect(last.result).toBe(0)
  })

  it('scadere: (3 - 5) mod 12 = 10', () => {
    const last = lastResult({ a: 3, b: 5, m: 12, op: 'scadere' })
    expect(last.done).toBe(true)
    expect(last.result).toBe(10)
  })

  it('inmultire: (4 * 4) mod 12 = 4', () => {
    const last = lastResult({ a: 4, b: 4, m: 12, op: 'inmultire' })
    expect(last.done).toBe(true)
    expect(last.result).toBe(4)
  })

  it('throws when m is below 2', () => {
    expect(() =>
      generateModularClock({ a: 7, b: 5, m: 1, op: 'adunare' }),
    ).toThrow()
  })

  it('throws when total dial steps exceed 400', () => {
    // inmultire walks a*b = 1000*1000 = 1_000_000 steps → exceeds cap.
    expect(() =>
      generateModularClock({ a: 1000, b: 1000, m: 24, op: 'inmultire' }),
    ).toThrow()
  })
})
