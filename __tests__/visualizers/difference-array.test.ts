import { describe, it, expect } from 'vitest'
import { generateDifferenceArray } from '@/lib/visualizers/generators/difference-array'

function brute(n: number, updates: { l: number; r: number; val: number }[]) {
  const a = new Array<number>(n).fill(0)
  for (const u of updates)
    for (let i = u.l; i <= u.r; i++) a[i] += u.val
  return a
}

describe('generateDifferenceArray', () => {
  it('throws on n < 1', () => {
    expect(() => generateDifferenceArray({ n: 0, updates: [] })).toThrow()
  })

  it('throws on invalid update interval', () => {
    expect(() =>
      generateDifferenceArray({ n: 5, updates: [{ l: 2, r: 1, val: 1 }] }),
    ).toThrow()
    expect(() =>
      generateDifferenceArray({ n: 5, updates: [{ l: 0, r: 5, val: 1 }] }),
    ).toThrow()
  })

  it('rebuilt result matches brute-force range updates', () => {
    const n = 8
    const updates = [
      { l: 1, r: 4, val: 3 },
      { l: 2, r: 6, val: 2 },
      { l: 0, r: 3, val: -1 },
    ]
    const frames = generateDifferenceArray({ n, updates })
    const last = frames.at(-1)!
    expect(last.state.done).toBe(true)
    expect([...last.state.result]).toEqual(brute(n, updates))
  })

  it('apply phase has one frame per update', () => {
    const updates = [
      { l: 0, r: 1, val: 1 },
      { l: 1, r: 2, val: 5 },
    ]
    const frames = generateDifferenceArray({ n: 4, updates })
    expect(frames.filter(f => f.state.phase === 'apply' && f.state.update)).toHaveLength(
      updates.length,
    )
  })

  it('rebuild phase has one frame per index', () => {
    const frames = generateDifferenceArray({
      n: 5,
      updates: [{ l: 0, r: 4, val: 2 }],
    })
    expect(frames.filter(f => f.state.phase === 'rebuild')).toHaveLength(5)
  })
})
