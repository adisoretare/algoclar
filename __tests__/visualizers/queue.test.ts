import { describe, it, expect } from 'vitest'
import { generateQueue } from '@/lib/visualizers/generators/queue'

describe('generateQueue', () => {
  it('throws on empty input', () => {
    expect(() => generateQueue({ values: [] })).toThrow()
  })

  it('dequeue order equals enqueue order (FIFO)', () => {
    const frames = generateQueue({ values: [1, 2, 3, 4] })
    const out = frames
      .filter(f => f.state.op === 'dequeue')
      .map(f => f.state.highlight)
    expect(out).toEqual([1, 2, 3, 4])
  })

  it('ends empty and done', () => {
    const last = generateQueue({ values: [9, 8] }).at(-1)!.state
    expect(last.items).toEqual([])
    expect(last.done).toBe(true)
  })
})
