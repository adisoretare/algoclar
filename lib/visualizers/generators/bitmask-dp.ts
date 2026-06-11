import type { Frame, FrameGenerator } from '../types'

export interface BitmaskDpState {
  n: number
  dist: readonly (readonly number[])[]
  dp: readonly (readonly (number | null)[])[] // dp[mask][i]
  mask: number | null
  endCity: number | null // i: current end of path
  newCity: number | null // j: city being appended
  phase: 'fill' | 'close' | 'done'
  result: number | null
  done: boolean
}

export interface BitmaskDpInput {
  dist: number[][] // symmetric or not, dist[i][j]
}

/**
 * Travelling Salesman via Held–Karp bitmask DP. dp[mask][i] = cheapest path that
 * starts at city 0, visits exactly the set `mask`, and ends at city i. The mask
 * encodes "which cities are visited" in O(2ⁿ·n) states instead of n! routes.
 */
export const generateBitmaskDp: FrameGenerator<
  BitmaskDpInput,
  BitmaskDpState
> = ({ dist }) => {
  const n = dist.length
  if (n < 2) throw new Error('generateBitmaskDp: nevoie de cel puțin 2 orașe')
  if (n > 6) throw new Error('generateBitmaskDp: maximum 6 orașe')
  if (dist.some(row => row.length !== n))
    throw new Error('generateBitmaskDp: matrice de distanțe invalidă')

  const FULL = (1 << n) - 1
  const dp: (number | null)[][] = Array.from({ length: 1 << n }, () =>
    new Array<number | null>(n).fill(null),
  )
  const frames: Frame<BitmaskDpState>[] = []

  const snap = (over: Partial<BitmaskDpState>): BitmaskDpState => ({
    n,
    dist,
    dp: dp.map(row => [...row]),
    mask: null,
    endCity: null,
    newCity: null,
    phase: 'fill',
    result: null,
    done: false,
    ...over,
  })

  dp[1][0] = 0
  frames.push({
    state: snap({ mask: 1, endCity: 0 }),
    explanation: `Pornim din orașul 0: dp[{0}][0] = 0. „mask” = mulțimea orașelor vizitate, scrisă în binar.`,
  })

  for (let mask = 1; mask <= FULL; mask++) {
    if (!(mask & 1)) continue // every path starts at city 0
    for (let i = 0; i < n; i++) {
      if (dp[mask][i] === null || !(mask & (1 << i))) continue
      for (let j = 0; j < n; j++) {
        if (mask & (1 << j)) continue // j already visited
        const nm = mask | (1 << j)
        const cost = (dp[mask][i] as number) + dist[i][j]
        if (dp[nm][j] === null || cost < (dp[nm][j] as number)) {
          dp[nm][j] = cost
          frames.push({
            state: snap({ mask: nm, endCity: j, newCity: j }),
            explanation: `Extindem un drum care se termină în ${i} (cost ${dp[mask][i]}) spre ${j}: dp[${nm.toString(2).padStart(n, '0')}][${j}] = ${dp[mask][i]} + ${dist[i][j]} = ${cost}.`,
          })
        }
      }
    }
  }

  // close the tour back to 0
  let result: number | null = null
  for (let i = 1; i < n; i++) {
    if (dp[FULL][i] === null) continue
    const tour = (dp[FULL][i] as number) + dist[i][0]
    if (result === null || tour < result) result = tour
  }
  frames.push({
    state: snap({ phase: 'close', mask: FULL, result }),
    explanation: `Toate orașele vizitate. Închidem turul întorcându-ne în 0 și luăm minimul peste ultimul oraș.`,
  })

  frames.push({
    state: snap({ phase: 'done', mask: FULL, result, done: true }),
    explanation: `Turul minim (TSP) costă ${result}. DP pe stări exponențiale: 2ⁿ măști, nu n! permutări.`,
  })

  return frames
}
