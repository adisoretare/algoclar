import { describe, it, expect } from 'vitest'
import { generateSieve } from '@/lib/visualizers/generators/sieve'

describe('generateSieve', () => {
  it('throws for n below 2', () => {
    expect(() => generateSieve({ n: 1 })).toThrow()
  })

  it('throws for n above 120', () => {
    expect(() => generateSieve({ n: 200 })).toThrow()
  })

  it('handles the smallest valid input n = 2', () => {
    const frames = generateSieve({ n: 2 })
    const last = frames.at(-1)!
    expect(last.state.done).toBe(true)
    expect([...last.state.primes]).toEqual([2])
  })

  it('finds the primes up to 30', () => {
    const frames = generateSieve({ n: 30 })
    const last = frames.at(-1)!
    expect(last.state.done).toBe(true)
    expect([...last.state.primes]).toEqual([
      2, 3, 5, 7, 11, 13, 17, 19, 23, 29,
    ])
  })

  it('marks every non-prime as composite by the end', () => {
    const frames = generateSieve({ n: 30 })
    const last = frames.at(-1)!
    for (let v = 2; v <= 30; v++) {
      const isPrime = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29].includes(v)
      expect(last.state.statuses[v]).toBe(isPrime ? 'prime' : 'composite')
    }
  })

  it('emits one frame when selecting a new prime, then one per multiple crossed', () => {
    const frames = generateSieve({ n: 10 })
    // p = 2 selected -> 1 frame; multiples 4,6,8,10 -> 4 frames.
    // p = 3 selected -> 1 frame; multiples 9 -> 1 frame.
    // (4 not prime, skipped; loop ends since 4*4 > 10) then final frame.
    const selectionFrames = frames.filter(
      f => f.state.multiple === -1 && !f.state.done,
    )
    expect(selectionFrames).toHaveLength(2)
    expect(selectionFrames.map(f => f.state.p)).toEqual([2, 3])
  })

  it('the prime list never shrinks across frames', () => {
    const frames = generateSieve({ n: 50 })
    for (let i = 1; i < frames.length; i++) {
      expect(frames[i].state.primes.length).toBeGreaterThanOrEqual(
        frames[i - 1].state.primes.length,
      )
    }
  })
})
