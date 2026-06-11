import type { Frame, FrameGenerator } from '../types'

export interface Rect {
  r1: number
  c1: number
  r2: number
  c2: number
}

export interface PrefixSums2DState {
  grid: readonly (readonly number[])[]
  prefix: readonly (readonly number[])[] // (rows+1) x (cols+1)
  phase: 'build' | 'query' | 'done'
  buildR: number // prefix row being filled (1..rows), else -1
  buildC: number // prefix col being filled (1..cols), else -1
  query: Rect // 0-based inclusive rectangle
  queryStage: 0 | 1 | 2 | 3 | 4 // which inclusion-exclusion term is highlighted
  result: number | null
  done: boolean
}

export interface PrefixSums2DInput {
  grid: number[][]
  query: Rect // 0-based inclusive
}

/**
 * Builds the 2D prefix table row-major:
 *   P[i][j] = g[i-1][j-1] + P[i-1][j] + P[i][j-1] - P[i-1][j-1]
 * then answers a rectangle sum by inclusion-exclusion:
 *   sum = P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1]
 */
export const generatePrefixSums2D: FrameGenerator<
  PrefixSums2DInput,
  PrefixSums2DState
> = ({ grid, query }) => {
  const rows = grid.length
  if (rows === 0 || grid[0].length === 0) {
    throw new Error('generatePrefixSums2D: grila nu poate fi goală')
  }
  const cols = grid[0].length
  if (grid.some(row => row.length !== cols)) {
    throw new Error('generatePrefixSums2D: toate liniile trebuie să aibă aceeași lungime')
  }
  const { r1, c1, r2, c2 } = query
  if (r1 < 0 || c1 < 0 || r2 >= rows || c2 >= cols || r1 > r2 || c1 > c2) {
    throw new Error('generatePrefixSums2D: dreptunghi invalid')
  }

  const prefix = Array.from({ length: rows + 1 }, () =>
    new Array<number>(cols + 1).fill(0),
  )
  const frames: Frame<PrefixSums2DState>[] = []

  const snapshot = (
    buildR: number,
    buildC: number,
    phase: PrefixSums2DState['phase'],
    queryStage: PrefixSums2DState['queryStage'],
    result: number | null,
    done: boolean,
  ): PrefixSums2DState => ({
    grid,
    prefix: prefix.map(row => [...row]),
    phase,
    buildR,
    buildC,
    query,
    queryStage,
    result,
    done,
  })

  frames.push({
    state: snapshot(-1, -1, 'build', 0, null, false),
    explanation: `Rândul și coloana 0 din prefix rămân 0 (santinele). Calculăm restul de sus în jos, de la stânga la dreapta.`,
  })

  for (let i = 1; i <= rows; i++) {
    for (let j = 1; j <= cols; j++) {
      prefix[i][j] =
        grid[i - 1][j - 1] +
        prefix[i - 1][j] +
        prefix[i][j - 1] -
        prefix[i - 1][j - 1]
      frames.push({
        state: snapshot(i, j, 'build', 0, null, false),
        explanation: `P[${i}][${j}] = g[${i - 1}][${j - 1}] + P[${i - 1}][${j}] + P[${i}][${j - 1}] − P[${i - 1}][${j - 1}] = ${grid[i - 1][j - 1]} + ${prefix[i - 1][j]} + ${prefix[i][j - 1]} − ${prefix[i - 1][j - 1]} = ${prefix[i][j]}.`,
      })
    }
  }

  const A = prefix[r2 + 1][c2 + 1]
  const B = prefix[r1][c2 + 1]
  const C = prefix[r2 + 1][c1]
  const D = prefix[r1][c1]

  frames.push({
    state: snapshot(-1, -1, 'query', 1, null, false),
    explanation: `Sumă pe dreptunghiul (${r1},${c1})–(${r2},${c2}). Pornim de la P[${r2 + 1}][${c2 + 1}] = ${A} (tot ce e sus-stânga inclusiv).`,
  })
  frames.push({
    state: snapshot(-1, -1, 'query', 2, null, false),
    explanation: `Scădem banda de deasupra: P[${r1}][${c2 + 1}] = ${B}.`,
  })
  frames.push({
    state: snapshot(-1, -1, 'query', 3, null, false),
    explanation: `Scădem banda din stânga: P[${r2 + 1}][${c1}] = ${C}.`,
  })
  frames.push({
    state: snapshot(-1, -1, 'query', 4, null, false),
    explanation: `Am scăzut colțul comun de două ori — îl adăugăm înapoi: P[${r1}][${c1}] = ${D}.`,
  })

  const result = A - B - C + D
  frames.push({
    state: snapshot(-1, -1, 'done', 4, result, true),
    explanation: `Sumă = ${A} − ${B} − ${C} + ${D} = ${result}. Orice dreptunghi se calculează în O(1) prin incluziune-excluziune.`,
  })

  return frames
}
