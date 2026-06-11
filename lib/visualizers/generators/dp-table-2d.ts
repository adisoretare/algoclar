import type { Frame, FrameGenerator } from '../types'

export type Cell = readonly [number, number]

export interface DpTable2DState {
  a: string
  b: string
  table: readonly (number | null)[][] // (|a|+1) x (|b|+1)
  curR: number // -1 at done
  curC: number
  deps: readonly Cell[]
  match: boolean
  result: number | null
  done: boolean
}

export interface DpTable2DInput {
  a: string
  b: string
}

/**
 * Longest Common Subsequence as a 2D DP table. For each pair of prefixes:
 *   if a[i-1] == b[j-1]:  dp[i][j] = dp[i-1][j-1] + 1   (diagonal)
 *   else:                 dp[i][j] = max(dp[i-1][j], dp[i][j-1])
 * The bottom-right cell is the LCS length.
 */
export const generateDpTable2D: FrameGenerator<
  DpTable2DInput,
  DpTable2DState
> = ({ a, b }) => {
  if (a.length === 0 || b.length === 0) {
    throw new Error('generateDpTable2D: ambele șiruri trebuie să fie nevide')
  }
  if (a.length > 10 || b.length > 10) {
    throw new Error('generateDpTable2D: maximum 10 caractere per șir')
  }

  const rows = a.length
  const cols = b.length
  const table: (number | null)[][] = Array.from({ length: rows + 1 }, () =>
    new Array<number | null>(cols + 1).fill(null),
  )
  for (let i = 0; i <= rows; i++) table[i][0] = 0
  for (let j = 0; j <= cols; j++) table[0][j] = 0

  const frames: Frame<DpTable2DState>[] = []

  const snap = (
    curR: number,
    curC: number,
    deps: Cell[],
    match: boolean,
    result: number | null,
    done: boolean,
  ): DpTable2DState => ({
    a,
    b,
    table: table.map(row => [...row]),
    curR,
    curC,
    deps,
    match,
    result,
    done,
  })

  frames.push({
    state: snap(-1, -1, [], false, null, false),
    explanation: `Rândul și coloana 0 sunt 0: un șir gol nu are nimic în comun. Completăm restul rând cu rând.`,
  })

  for (let i = 1; i <= rows; i++) {
    for (let j = 1; j <= cols; j++) {
      const match = a[i - 1] === b[j - 1]
      let deps: Cell[]
      if (match) {
        table[i][j] = (table[i - 1][j - 1] as number) + 1
        deps = [[i - 1, j - 1]]
        frames.push({
          state: snap(i, j, deps, true, null, false),
          explanation: `'${a[i - 1]}' = '${b[j - 1]}' → potrivire. dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${table[i][j]}.`,
        })
      } else {
        const up = table[i - 1][j] as number
        const left = table[i][j - 1] as number
        table[i][j] = Math.max(up, left)
        deps =
          up >= left ? [[i - 1, j]] : [[i, j - 1]]
        frames.push({
          state: snap(i, j, deps, false, null, false),
          explanation: `'${a[i - 1]}' ≠ '${b[j - 1]}' → luăm maximul vecinilor: dp[${i}][${j}] = max(${up}, ${left}) = ${table[i][j]}.`,
        })
      }
    }
  }

  frames.push({
    state: snap(-1, -1, [], false, table[rows][cols], true),
    explanation: `Cea mai lungă subsecvență comună are lungimea ${table[rows][cols]} (colțul dreapta-jos).`,
  })

  return frames
}
