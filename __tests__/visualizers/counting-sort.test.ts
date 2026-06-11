import { describe, it, expect } from 'vitest'
import { generateCountingSort } from '@/lib/visualizers/generators/counting-sort'

describe('generateCountingSort', () => {
  it('throws on empty array', () => {
    expect(() => generateCountingSort({ array: [] })).toThrow()
  })

  it('throws on negative values', () => {
    expect(() => generateCountingSort({ array: [2, -1] })).toThrow()
  })

  it('final output is the sorted input', () => {
    const array = [4, 1, 2, 1, 0, 4, 2]
    const frames = generateCountingSort({ array })
    const last = frames.at(-1)!
    expect(last.state.done).toBe(true)
    expect(last.state.phase).toBe('done')
    expect([...last.state.output]).toEqual([...array].sort((a, b) => a - b))
  })

  it('count phase has one frame per element', () => {
    const array = [2, 0, 1, 2]
    const frames = generateCountingSort({ array })
    const countFrames = frames.filter(f => f.state.phase === 'count')
    expect(countFrames).toHaveLength(array.length)
  })

  it('output never shrinks during the emit phase', () => {
    const frames = generateCountingSort({ array: [3, 0, 3, 1, 2] })
    const emit = frames.filter(f => f.state.phase === 'emit')
    for (let i = 1; i < emit.length; i++) {
      expect(emit[i].state.output.length).toBeGreaterThanOrEqual(
        emit[i - 1].state.output.length,
      )
    }
  })
})
