import type { Frame, FrameGenerator } from '../types'

export type Decision = 'none' | 'in' | 'out'

export interface BacktrackingState {
  items: readonly number[]
  target: number
  status: readonly Decision[] // decision per item in the current path
  depth: number // index currently being decided
  partial: number // sum of included items so far
  event: 'enter' | 'include' | 'exclude' | 'prune' | 'found' | 'deadend'
  solutions: readonly (readonly number[])[] // found subsets (values)
  done: boolean
}

export interface BacktrackingInput {
  items: number[] // non-negative
  target: number
}

/**
 * Subset-sum by backtracking: at each item decide include / exclude, building a
 * binary decision tree. The branch is PRUNED as soon as the running sum exceeds
 * the target — that cut is the whole reason backtracking beats brute force.
 */
export const generateBacktracking: FrameGenerator<
  BacktrackingInput,
  BacktrackingState
> = ({ items, target }) => {
  if (items.length === 0) {
    throw new Error('generateBacktracking: nevoie de cel puțin un element')
  }
  if (items.some(v => v < 0)) {
    throw new Error('generateBacktracking: elementele trebuie să fie ≥ 0')
  }

  const n = items.length
  const frames: Frame<BacktrackingState>[] = []
  const status: Decision[] = new Array(n).fill('none')
  const solutions: number[][] = []

  const push = (
    event: BacktrackingState['event'],
    depth: number,
    partial: number,
    explanation: string,
  ) => {
    frames.push({
      state: {
        items,
        target,
        status: [...status],
        depth,
        partial,
        event,
        solutions: solutions.map(s => [...s]),
        done: false,
      },
      explanation,
    })
  }

  push('enter', 0, 0, `Căutăm o submulțime cu suma ${target}. La fiecare element alegem: îl includem sau nu.`)

  const dfs = (i: number, partial: number) => {
    if (partial > target) {
      push('prune', i, partial, `Suma parțială ${partial} > ${target}. Tăiem ramura — orice am adăuga mai departe doar crește suma.`)
      return
    }
    if (i === n) {
      if (partial === target) {
        const chosen = items.filter((_, idx) => status[idx] === 'in')
        solutions.push(chosen)
        push('found', i, partial, `Frunză cu suma ${target} — soluție găsită: { ${chosen.join(', ')} }.`)
      } else {
        push('deadend', i, partial, `Frunză cu suma ${partial} ≠ ${target}. Ne întoarcem.`)
      }
      return
    }

    status[i] = 'in'
    push('include', i + 1, partial + items[i], `Includem ${items[i]}. Suma parțială devine ${partial + items[i]}.`)
    dfs(i + 1, partial + items[i])

    status[i] = 'out'
    push('exclude', i + 1, partial, `Revenim și excludem ${items[i]}. Suma parțială rămâne ${partial}.`)
    dfs(i + 1, partial)

    status[i] = 'none'
  }

  dfs(0, 0)

  frames.push({
    state: {
      items,
      target,
      status: new Array(n).fill('none'),
      depth: 0,
      partial: 0,
      event: solutions.length > 0 ? 'found' : 'deadend',
      solutions: solutions.map(s => [...s]),
      done: true,
    },
    explanation: `Gata: ${solutions.length} soluție(i). Backtracking explorează arborele de decizie, dar taie ramurile fără speranță în loc să încerce toate cele 2ⁿ submulțimi.`,
  })

  return frames
}
