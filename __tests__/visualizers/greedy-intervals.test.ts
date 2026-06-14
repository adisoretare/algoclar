import { describe, it, expect } from 'vitest'
import { generateGreedyIntervals } from '@/lib/visualizers/generators/greedy-intervals'
import type { GreedyInterval } from '@/lib/visualizers/generators/greedy-intervals'

const SAMPLE: Array<{ start: number; end: number }> = [
  { start: 1, end: 3 },
  { start: 2, end: 5 },
  { start: 4, end: 7 },
  { start: 6, end: 9 },
  { start: 8, end: 10 },
  { start: 5, end: 8 },
]

function selectedFrom(intervals: Array<{ start: number; end: number }>) {
  const frames = generateGreedyIntervals({ intervals })
  const last = frames.at(-1)!
  return last.state.intervals.filter(
    (it: GreedyInterval) => it.status === 'selected',
  )
}

describe('generateGreedyIntervals', () => {
  it('throws on empty input', () => {
    expect(() => generateGreedyIntervals({ intervals: [] })).toThrow()
  })

  it('throws when start > end', () => {
    expect(() =>
      generateGreedyIntervals({ intervals: [{ start: 5, end: 2 }] }),
    ).toThrow()
  })

  it('throws on more than 10 intervals', () => {
    const many = Array.from({ length: 11 }, (_, i) => ({
      start: i,
      end: i + 1,
    }))
    expect(() => generateGreedyIntervals({ intervals: many })).toThrow()
  })

  it('throws on coordinates outside 0..30', () => {
    expect(() =>
      generateGreedyIntervals({ intervals: [{ start: 0, end: 31 }] }),
    ).toThrow()
  })

  it('first frame is sorted by end ascending', () => {
    const frames = generateGreedyIntervals({ intervals: SAMPLE })
    const ends = frames[0].state.intervals.map(it => it.end)
    const sortedEnds = [...ends].sort((a, b) => a - b)
    expect(ends).toEqual(sortedEnds)
  })

  it('selects the maximum count of non-overlapping intervals', () => {
    const selected = selectedFrom(SAMPLE)
    // By end-sort greedy: [1,3], [4,7], [8,10] → 3 intervals.
    expect(selected.length).toBe(3)
  })

  it('selected intervals are pairwise non-overlapping', () => {
    const selected = selectedFrom(SAMPLE)
    const ordered = [...selected].sort((a, b) => a.start - b.start)
    for (let i = 1; i < ordered.length; i++) {
      expect(ordered[i].start).toBeGreaterThanOrEqual(ordered[i - 1].end)
    }
  })

  it('emits a sort frame, one per interval, then a final done frame', () => {
    const frames = generateGreedyIntervals({ intervals: SAMPLE })
    expect(frames.length).toBe(SAMPLE.length + 2)
    expect(frames.at(-1)!.state.done).toBe(true)
    expect(frames.at(-1)!.state.selectedCount).toBe(3)
  })
})
