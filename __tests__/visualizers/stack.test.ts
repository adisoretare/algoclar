import { describe, it, expect } from 'vitest'
import { generateStack } from '@/lib/visualizers/generators/stack'

describe('generateStack', () => {
  it('throws on empty input', () => {
    expect(() => generateStack({ values: [] })).toThrow()
  })

  it('ends empty and done', () => {
    const last = generateStack({ values: [1, 2, 3] }).at(-1)!.state
    expect(last.items).toEqual([])
    expect(last.done).toBe(true)
  })

  it('pop order is the reverse of push order (LIFO)', () => {
    const frames = generateStack({ values: [1, 2, 3, 4] })
    const popped = frames.filter(f => f.state.op === 'pop').map(f => f.state.highlight)
    expect(popped).toEqual([4, 3, 2, 1])
  })

  it('peak height equals number of values', () => {
    const frames = generateStack({ values: [5, 6, 7] })
    const maxHeight = Math.max(...frames.map(f => f.state.items.length))
    expect(maxHeight).toBe(3)
  })
})
