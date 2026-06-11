import type { Frame, FrameGenerator } from '../types'

export interface RangeUpdate {
  l: number // 0-based inclusive
  r: number // 0-based inclusive
  val: number
}

export interface DifferenceArrayState {
  n: number
  diff: readonly number[] // length n+1
  result: readonly number[] // length n, filled during the rebuild phase
  phase: 'apply' | 'rebuild' | 'done'
  updateIndex: number // index into updates during apply, else -1
  update: RangeUpdate | null // update being applied, else null
  touched: readonly number[] // diff indices just modified (highlight)
  rebuildIndex: number // i in 0..n-1 during rebuild, else -1
  done: boolean
}

export interface DifferenceArrayInput {
  n: number
  updates: RangeUpdate[]
}

/**
 * Difference array for offline range updates: each update (l, r, +val) becomes
 * diff[l] += val and diff[r+1] -= val (O(1) each). After all updates, a single
 * prefix-sum pass rebuilds the final array in O(n).
 */
export const generateDifferenceArray: FrameGenerator<
  DifferenceArrayInput,
  DifferenceArrayState
> = ({ n, updates }) => {
  if (n < 1) {
    throw new Error('generateDifferenceArray: n trebuie să fie ≥ 1')
  }
  for (const u of updates) {
    if (u.l < 0 || u.r >= n || u.l > u.r) {
      throw new Error('generateDifferenceArray: interval de update invalid')
    }
  }

  const diff = new Array<number>(n + 1).fill(0)
  const frames: Frame<DifferenceArrayState>[] = []

  const snapshot = (
    phase: DifferenceArrayState['phase'],
    updateIndex: number,
    update: RangeUpdate | null,
    touched: number[],
    result: number[],
    rebuildIndex: number,
    done: boolean,
  ): DifferenceArrayState => ({
    n,
    diff: [...diff],
    result: [...result],
    phase,
    updateIndex,
    update,
    touched,
    rebuildIndex,
    done,
  })

  frames.push({
    state: snapshot('apply', -1, null, [], [], -1, false),
    explanation: `Pornim cu un vector de diferențe diff de ${n + 1} zerouri. În loc să atingem fiecare element dintr-un interval, atingem doar 2 capete.`,
  })

  // Phase 1 — apply updates onto the difference array
  for (let i = 0; i < updates.length; i++) {
    const u = updates[i]
    diff[u.l] += u.val
    diff[u.r + 1] -= u.val
    frames.push({
      state: snapshot('apply', i, u, [u.l, u.r + 1], [], -1, false),
      explanation: `Update (+${u.val}) pe [${u.l}, ${u.r}]: diff[${u.l}] += ${u.val} și diff[${u.r + 1}] −= ${u.val}. Două operații, oricât de lung ar fi intervalul.`,
    })
  }

  // Phase 2 — rebuild via prefix sum
  const result: number[] = []
  let running = 0
  for (let i = 0; i < n; i++) {
    running += diff[i]
    result.push(running)
    const formula =
      i === 0
        ? `a[0] = diff[0] = ${running}`
        : `a[${i}] = a[${i - 1}] + diff[${i}] = ${running}`
    frames.push({
      state: snapshot('rebuild', -1, null, [], [...result], i, false),
      explanation: `Refacem: ${formula}. Suma prefix peste diff ne dă vectorul final.`,
    })
  }

  frames.push({
    state: snapshot('done', -1, null, [], [...result], -1, true),
    explanation: `Gata! ${updates.length} update-uri pe intervale, apoi o singură trecere O(n) pentru reconstrucție — în loc de a atinge fiecare interval element cu element.`,
  })

  return frames
}
