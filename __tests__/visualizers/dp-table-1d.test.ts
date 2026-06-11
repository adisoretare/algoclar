import { describe, it, expect } from 'vitest'
import { generateDpTable1D } from '@/lib/visualizers/generators/dp-table-1d'

describe('generateDpTable1D', () => {
  it('throws outside 2..20', () => {
    expect(() => generateDpTable1D({ n: 1 })).toThrow()
    expect(() => generateDpTable1D({ n: 21 })).toThrow()
  })

  it('fills the Fibonacci sequence', () => {
    const last = generateDpTable1D({ n: 10 }).at(-1)!.state
    expect([...last.table]).toEqual([0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55])
  })

  it('each non-base cell depends on the two before it', () => {
    const frames = generateDpTable1D({ n: 6 })
    const cell = frames.find(f => f.state.current === 4)!.state
    expect([...cell.deps].sort()).toEqual([2, 3])
  })
})
