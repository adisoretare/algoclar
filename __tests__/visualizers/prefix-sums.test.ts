import { describe, it, expect } from 'vitest'
import { generatePrefixSums } from '@/lib/visualizers/generators/prefix-sums'

describe('generatePrefixSums', () => {
  it('throws on empty array', () => {
    expect(() => generatePrefixSums({ array: [], l: 0, r: 0 })).toThrow()
  })

  it('throws on invalid interval', () => {
    expect(() => generatePrefixSums({ array: [1, 2, 3], l: 2, r: 1 })).toThrow()
    expect(() => generatePrefixSums({ array: [1, 2, 3], l: 0, r: 3 })).toThrow()
  })

  it('builds a correct prefix array', () => {
    const frames = generatePrefixSums({ array: [3, 1, 4, 1, 5], l: 1, r: 3 })
    const built = frames.find(f => f.state.buildIndex === 5)!
    expect([...built.state.prefix]).toEqual([0, 3, 4, 8, 9, 14])
  })

  it('interval query equals the direct sum', () => {
    const array = [3, 1, 4, 1, 5, 9, 2]
    const l = 2
    const r = 5
    const frames = generatePrefixSums({ array, l, r })
    const direct = array.slice(l, r + 1).reduce((a, b) => a + b, 0)
    const last = frames.at(-1)!
    expect(last.state.done).toBe(true)
    expect(last.state.result).toBe(direct)
  })

  it('handles a single-element interval', () => {
    const frames = generatePrefixSums({ array: [7, 8, 9], l: 1, r: 1 })
    expect(frames.at(-1)!.state.result).toBe(8)
  })
})
