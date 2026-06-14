import type { Frame, FrameGenerator } from '../types'

export interface Pos {
  r: number
  c: number
}

export interface SubmatrixSearchState {
  grid: readonly (readonly number[])[]
  pattern: readonly (readonly number[])[]
  anchor: Pos | null // top-left of the window currently inspected
  cmp: { dr: number; dc: number } | null // offset within window being compared
  matchSoFar: boolean // whether all compared cells so far have matched
  found: readonly Pos[] // anchors confirmed as matches so far
  phase: 'anchor' | 'compare' | 'anchor-done' | 'done'
  done: boolean
}

export interface SubmatrixSearchInput {
  grid: number[][]
  pattern: number[][]
}

/**
 * Brute-force 2D pattern search ("sliding window"):
 * for each top-left anchor (i,j) we compare the pattern cell-by-cell against
 * the grid window, stopping on the first mismatch. Anchors where every cell
 * matches are recorded as found positions.
 */
export const generateSubmatrixSearch: FrameGenerator<
  SubmatrixSearchInput,
  SubmatrixSearchState
> = ({ grid, pattern }) => {
  const R = grid.length
  if (R === 0 || grid[0].length === 0) {
    throw new Error('generateSubmatrixSearch: grila nu poate fi goală')
  }
  const C = grid[0].length
  if (grid.some(row => row.length !== C)) {
    throw new Error(
      'generateSubmatrixSearch: toate liniile grilei trebuie să aibă aceeași lungime',
    )
  }
  const PR = pattern.length
  if (PR === 0 || pattern[0].length === 0) {
    throw new Error('generateSubmatrixSearch: șablonul nu poate fi gol')
  }
  const PC = pattern[0].length
  if (pattern.some(row => row.length !== PC)) {
    throw new Error(
      'generateSubmatrixSearch: toate liniile șablonului trebuie să aibă aceeași lungime',
    )
  }
  if (R > 6 || C > 6) {
    throw new Error('generateSubmatrixSearch: grila poate fi cel mult 6×6')
  }
  if (PR > 4 || PC > 4) {
    throw new Error('generateSubmatrixSearch: șablonul poate fi cel mult 4×4')
  }
  if (PR > R || PC > C) {
    throw new Error(
      'generateSubmatrixSearch: șablonul nu încape în grilă',
    )
  }

  const found: Pos[] = []
  const frames: Frame<SubmatrixSearchState>[] = []

  const snapshot = (
    anchor: Pos | null,
    cmp: { dr: number; dc: number } | null,
    matchSoFar: boolean,
    phase: SubmatrixSearchState['phase'],
    done: boolean,
  ): SubmatrixSearchState => ({
    grid,
    pattern,
    anchor,
    cmp,
    matchSoFar,
    found: found.map(p => ({ ...p })),
    phase,
    done,
  })

  for (let i = 0; i <= R - PR; i++) {
    for (let j = 0; j <= C - PC; j++) {
      // New anchor selected — window outlined.
      frames.push({
        state: snapshot({ r: i, c: j }, null, true, 'anchor', false),
        explanation: `Ancoră (${i},${j}): potrivim colțul stânga-sus al șablonului peste m[${i}][${j}] și comparăm celulă cu celulă.`,
      })

      let allMatch = true
      outer: for (let dr = 0; dr < PR; dr++) {
        for (let dc = 0; dc < PC; dc++) {
          const pv = pattern[dr][dc]
          const gv = grid[i + dr][j + dc]
          const equal = pv === gv
          if (!equal) allMatch = false
          frames.push({
            state: snapshot(
              { r: i, c: j },
              { dr, dc },
              allMatch,
              'compare',
              false,
            ),
            explanation: equal
              ? `Ancoră (${i},${j}): comparăm șablon[${dr}][${dc}]=${pv} cu m[${i + dr}][${j + dc}]=${gv} ✓`
              : `Ancoră (${i},${j}): comparăm șablon[${dr}][${dc}]=${pv} cu m[${i + dr}][${j + dc}]=${gv} ✗, ancoră respinsă.`,
          })
          if (!equal) break outer
        }
      }

      if (allMatch) {
        found.push({ r: i, c: j })
        frames.push({
          state: snapshot({ r: i, c: j }, null, true, 'anchor-done', false),
          explanation: `Ancoră (${i},${j}): toate celulele coincid — șablonul apare aici! Am găsit ${found.length} potriviri până acum.`,
        })
      } else {
        frames.push({
          state: snapshot({ r: i, c: j }, null, false, 'anchor-done', false),
          explanation: `Ancoră (${i},${j}): nu se potrivește — trecem la următoarea poziție.`,
        })
      }
    }
  }

  const coords =
    found.length > 0
      ? found.map(p => `(${p.r},${p.c})`).join(', ')
      : '—'
  frames.push({
    state: snapshot(null, null, true, 'done', true),
    explanation:
      found.length > 0
        ? `Gata: șablonul apare de ${found.length} ori, la pozițiile ${coords}.`
        : `Gata: șablonul nu apare nicăieri în grilă (0 potriviri).`,
  })

  return frames
}
