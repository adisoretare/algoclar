import type { Frame, FrameGenerator } from '../types'

export type IntervalStatus = 'pending' | 'selected' | 'rejected'

export interface GreedyInterval {
  id: number
  start: number
  end: number
  status: IntervalStatus
}

export interface GreedyIntervalsState {
  intervals: readonly GreedyInterval[] // sorted by end ascending
  currentIndex: number // index of the interval being considered (-1 = none yet)
  lastEnd: number // end of the last selected interval (-Infinity before any)
  selectedCount: number
  done: boolean
}

export interface GreedyIntervalsInput {
  intervals: Array<{ start: number; end: number }>
}

/**
 * Greedy interval scheduling (selecția activităților):
 * sort intervals by end ascending; iterate left to right and keep an interval
 * only if its start >= the end of the last kept one (no overlap). This yields
 * the maximum number of pairwise non-overlapping intervals.
 */
export const generateGreedyIntervals: FrameGenerator<
  GreedyIntervalsInput,
  GreedyIntervalsState
> = ({ intervals }) => {
  if (intervals.length === 0) {
    throw new Error(
      'generateGreedyIntervals: introdu cel puțin un interval.',
    )
  }
  if (intervals.length > 10) {
    throw new Error('generateGreedyIntervals: maximum 10 intervale.')
  }
  for (const iv of intervals) {
    if (iv.start > iv.end) {
      throw new Error(
        `generateGreedyIntervals: intervalul [${iv.start},${iv.end}] are începutul mai mare decât sfârșitul.`,
      )
    }
    if (
      iv.start < 0 ||
      iv.start > 30 ||
      iv.end < 0 ||
      iv.end > 30
    ) {
      throw new Error(
        'generateGreedyIntervals: coordonatele trebuie să fie între 0 și 30.',
      )
    }
  }

  // Sort by end ascending; stable tiebreak on start so output is deterministic.
  const sorted = [...intervals]
    .map((iv, i) => ({ ...iv, originalIndex: i }))
    .sort((a, b) => a.end - b.end || a.start - b.start)
    .map((iv, i) => ({
      id: i,
      start: iv.start,
      end: iv.end,
      status: 'pending' as IntervalStatus,
    }))

  const frames: Frame<GreedyIntervalsState>[] = []

  const snapshot = (items: GreedyInterval[]): GreedyInterval[] =>
    items.map(it => ({ ...it }))

  // Frame 0: after sorting, everything pending.
  frames.push({
    state: {
      intervals: snapshot(sorted),
      currentIndex: -1,
      lastEnd: Number.NEGATIVE_INFINITY,
      selectedCount: 0,
      done: false,
    },
    explanation: `Sortăm intervalele crescător după capătul din dreapta (sfârșit). Astfel, terminăm cât mai devreme și lăsăm loc pentru cât mai multe intervale după.`,
  })

  let lastEnd = Number.NEGATIVE_INFINITY
  let selectedCount = 0

  for (let i = 0; i < sorted.length; i++) {
    const iv = sorted[i]
    const hasPrev = selectedCount > 0
    if (iv.start >= lastEnd) {
      iv.status = 'selected'
      selectedCount++
      const prevEnd = lastEnd
      lastEnd = iv.end
      frames.push({
        state: {
          intervals: snapshot(sorted),
          currentIndex: i,
          lastEnd,
          selectedCount,
          done: false,
        },
        explanation: hasPrev
          ? `Interval [${iv.start},${iv.end}]: start ${iv.start} ≥ ultimul sfârșit ${prevEnd} → îl alegem; ultimul sfârșit devine ${iv.end}.`
          : `Interval [${iv.start},${iv.end}]: primul considerat → îl alegem; ultimul sfârșit devine ${iv.end}.`,
      })
    } else {
      iv.status = 'rejected'
      frames.push({
        state: {
          intervals: snapshot(sorted),
          currentIndex: i,
          lastEnd,
          selectedCount,
          done: false,
        },
        explanation: `Interval [${iv.start},${iv.end}]: start ${iv.start} < ultimul sfârșit ${lastEnd} → se suprapune, îl respingem.`,
      })
    }
  }

  // Final frame: summary.
  frames.push({
    state: {
      intervals: snapshot(sorted),
      currentIndex: -1,
      lastEnd,
      selectedCount,
      done: true,
    },
    explanation: `Gata! Am ales ${selectedCount} ${
      selectedCount === 1 ? 'interval' : 'intervale'
    } care nu se suprapun — numărul maxim posibil.`,
  })

  return frames
}
