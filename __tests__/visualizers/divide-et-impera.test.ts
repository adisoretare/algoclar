import { describe, it, expect } from 'vitest'
import { generateDivideEtImpera } from '@/lib/visualizers/generators/divide-et-impera'

describe('generateDivideEtImpera', () => {
  it('throws on fewer than 2 values', () => {
    expect(() => generateDivideEtImpera({ array: [1] })).toThrow()
  })

  it('final array is fully sorted', () => {
    const array = [5, 2, 8, 1, 9, 3, 7, 4, 6]
    const last = generateDivideEtImpera({ array }).at(-1)!.state
    expect(last.done).toBe(true)
    expect([...last.array]).toEqual([...array].sort((a, b) => a - b))
  })

  it('has both split and merge phases', () => {
    const frames = generateDivideEtImpera({ array: [3, 1, 2, 4] })
    expect(frames.some(f => f.state.phase === 'split')).toBe(true)
    expect(frames.some(f => f.state.phase === 'merge')).toBe(true)
  })

  it('each merge frame leaves its segment locally sorted', () => {
    const frames = generateDivideEtImpera({ array: [4, 1, 3, 2, 6, 5] })
    for (const f of frames) {
      if (f.state.phase === 'merge' && !f.state.done) {
        const seg = f.state.array.slice(f.state.lo, f.state.hi + 1)
        const sorted = [...seg].sort((a, b) => a - b)
        expect(seg).toEqual(sorted)
      }
    }
  })
})
