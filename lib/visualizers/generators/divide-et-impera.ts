import type { Frame, FrameGenerator } from '../types'

export interface DivideState {
  array: readonly number[]
  lo: number
  hi: number
  mid: number | null
  phase: 'split' | 'merge'
  depth: number
  done: boolean
}

export interface DivideInput {
  array: number[]
}

/**
 * Merge sort as the canonical divide-et-impera: split each segment in half down
 * to single elements, then merge the sorted halves back up. The array mutates
 * as merges complete, so you watch order emerge bottom-up.
 */
export const generateDivideEtImpera: FrameGenerator<
  DivideInput,
  DivideState
> = ({ array }) => {
  if (array.length < 2) {
    throw new Error('generateDivideEtImpera: nevoie de cel puțin 2 valori')
  }

  const work = [...array]
  const frames: Frame<DivideState>[] = []

  const snap = (
    lo: number,
    hi: number,
    mid: number | null,
    phase: 'split' | 'merge',
    depth: number,
  ): DivideState => ({
    array: [...work],
    lo,
    hi,
    mid,
    phase,
    depth,
    done: false,
  })

  const merge = (lo: number, mid: number, hi: number) => {
    const left = work.slice(lo, mid + 1)
    const right = work.slice(mid + 1, hi + 1)
    let i = 0
    let j = 0
    let k = lo
    while (i < left.length && j < right.length) {
      work[k++] = left[i] <= right[j] ? left[i++] : right[j++]
    }
    while (i < left.length) work[k++] = left[i++]
    while (j < right.length) work[k++] = right[j++]
  }

  const sort = (lo: number, hi: number, depth: number) => {
    if (lo >= hi) return
    const mid = (lo + hi) >> 1
    frames.push({
      state: snap(lo, hi, mid, 'split', depth),
      explanation: `Împărțim segmentul [${lo}, ${hi}] în două: [${lo}, ${mid}] și [${mid + 1}, ${hi}].`,
    })
    sort(lo, mid, depth + 1)
    sort(mid + 1, hi, depth + 1)
    merge(lo, mid, hi)
    frames.push({
      state: snap(lo, hi, mid, 'merge', depth),
      explanation: `Interclasăm cele două jumătăți sortate într-un segment [${lo}, ${hi}] ordonat: ${work.slice(lo, hi + 1).join(', ')}.`,
    })
  }

  sort(0, work.length - 1, 0)

  frames.push({
    state: { array: [...work], lo: 0, hi: work.length - 1, mid: null, phase: 'merge', depth: 0, done: true },
    explanation: `Vector sortat. Divide et impera: problema mare s-a rezolvat combinând soluțiile a două subprobleme de jumătate — O(n log n).`,
  })

  return frames
}
