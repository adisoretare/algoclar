import { describe, it, expect } from 'vitest'
import { generateDeque } from '@/lib/visualizers/generators/deque'

describe('generateDeque', () => {
  it('throws on empty input', () => {
    expect(() => generateDeque({ values: [] })).toThrow()
  })

  it('uses all four operations', () => {
    const frames = generateDeque({ values: [1, 2, 3, 4, 5] })
    const ops = new Set(frames.map(f => f.state.op).filter(Boolean))
    expect(ops).toContain('pushBack')
    expect(ops).toContain('pushFront')
    expect(ops).toContain('popFront')
    expect(ops).toContain('popBack')
  })

  it('builds front/back correctly (even->back, odd->front)', () => {
    // values [10,20,30]: pushBack 10 -> [10]; pushFront 20 -> [20,10]; pushBack 30 -> [20,10,30]
    const frames = generateDeque({ values: [10, 20, 30] })
    const afterBuild = frames.filter(f => f.state.op?.startsWith('push')).at(-1)!.state
    expect(afterBuild.items).toEqual([20, 10, 30])
  })

  it('ends empty and done', () => {
    const last = generateDeque({ values: [1, 2, 3] }).at(-1)!.state
    expect(last.items).toEqual([])
    expect(last.done).toBe(true)
  })
})
