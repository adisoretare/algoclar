import { describe, it, expect } from 'vitest'
import { generateSetMap } from '@/lib/visualizers/generators/set-map'

const PAIRS = [
  { k: 1, v: 100 },
  { k: 5, v: 500 },
  { k: 3, v: 300 },
]

describe('generateSetMap', () => {
  it('throws on empty set values', () => {
    expect(() =>
      generateSetMap({ setValues: [], contains: 1, pairs: PAIRS, getKey: 1 }),
    ).toThrow()
  })

  it('keeps the set sorted and unique', () => {
    const frames = generateSetMap({
      setValues: [5, 1, 3, 5, 1, 9],
      contains: 3,
      pairs: PAIRS,
      getKey: 5,
    })
    const last = frames.at(-1)!.state
    expect([...last.set]).toEqual([1, 3, 5, 9])
  })

  it('contains() reports true for a present value', () => {
    const frames = generateSetMap({
      setValues: [2, 4, 6],
      contains: 4,
      pairs: PAIRS,
      getKey: 1,
    })
    const q = frames.find(f => f.state.phase === 'query-set' && f.state.found === true)
    expect(q).toBeTruthy()
  })

  it('contains() reports false for an absent value', () => {
    const frames = generateSetMap({
      setValues: [2, 4, 6],
      contains: 5,
      pairs: PAIRS,
      getKey: 1,
    })
    const q = frames.find(f => f.state.phase === 'query-set' && f.state.found === false)
    expect(q).toBeTruthy()
  })

  it('get() returns the value for an existing key', () => {
    const frames = generateSetMap({
      setValues: [1],
      contains: 1,
      pairs: PAIRS,
      getKey: 5,
    })
    const q = frames.find(f => f.state.phase === 'query-map')!.state
    expect(q.queryResult).toBe('500')
    expect(q.found).toBe(true)
  })

  it('map updates value on duplicate key instead of adding', () => {
    const frames = generateSetMap({
      setValues: [1],
      contains: 1,
      pairs: [
        { k: 7, v: 1 },
        { k: 7, v: 2 },
      ],
      getKey: 7,
    })
    const last = frames.at(-1)!.state
    expect(last.map).toEqual([{ k: 7, v: 2 }])
  })
})
