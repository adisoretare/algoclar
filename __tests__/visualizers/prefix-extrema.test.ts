import { describe, it, expect } from 'vitest'
import { generatePrefixExtrema } from '@/lib/visualizers/generators/prefix-extrema'

const ARR = [3, 1, 4, 1, 5, 9, 2, 6]

describe('generatePrefixExtrema', () => {
  it('throws on empty array', () => {
    expect(() =>
      generatePrefixExtrema({ array: [], direction: 'prefix', kind: 'max' }),
    ).toThrow()
  })

  it('throws on more than 15 values', () => {
    const big = Array.from({ length: 16 }, (_, i) => i)
    expect(() =>
      generatePrefixExtrema({ array: big, direction: 'prefix', kind: 'max' }),
    ).toThrow()
  })

  it('computes prefix-max correctly', () => {
    const frames = generatePrefixExtrema({
      array: ARR,
      direction: 'prefix',
      kind: 'max',
    })
    expect([...frames.at(-1)!.state.result]).toEqual([3, 3, 4, 4, 5, 9, 9, 9])
    expect(frames.at(-1)!.state.done).toBe(true)
  })

  it('computes suffix-max correctly', () => {
    const frames = generatePrefixExtrema({
      array: ARR,
      direction: 'sufix',
      kind: 'max',
    })
    expect([...frames.at(-1)!.state.result]).toEqual([9, 9, 9, 9, 9, 9, 6, 6])
  })

  it('computes prefix-min correctly', () => {
    const frames = generatePrefixExtrema({
      array: ARR,
      direction: 'prefix',
      kind: 'min',
    })
    expect([...frames.at(-1)!.state.result]).toEqual([3, 1, 1, 1, 1, 1, 1, 1])
  })

  it('emits one frame per index', () => {
    const frames = generatePrefixExtrema({
      array: ARR,
      direction: 'prefix',
      kind: 'max',
    })
    expect(frames.length).toBe(ARR.length)
  })

  it('handles a single-element array', () => {
    const frames = generatePrefixExtrema({
      array: [7],
      direction: 'sufix',
      kind: 'min',
    })
    expect(frames.length).toBe(1)
    expect([...frames.at(-1)!.state.result]).toEqual([7])
    expect(frames.at(-1)!.state.done).toBe(true)
  })
})
