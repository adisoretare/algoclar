import type { Frame, FrameGenerator } from '../types'

export type MatrixTraversalMode = 'linii' | 'coloane' | 'diagonale' | 'spirala'

export interface Cell {
  r: number
  c: number
}

export interface MatrixTraversalState {
  grid: readonly (readonly number[])[]
  mode: MatrixTraversalMode
  current: Cell | null
  visited: readonly Cell[] // ordered list of already-visited cells (incl. current)
  output: readonly number[] // running output sequence
  done: boolean
}

export interface MatrixTraversalInput {
  grid: number[][]
  mode: MatrixTraversalMode
}

const MODE_LABEL: Record<MatrixTraversalMode, string> = {
  linii: 'pe linii (row-major)',
  coloane: 'pe coloane (column-major)',
  diagonale: 'pe diagonale (secundare)',
  spirala: 'în spirală',
}

/**
 * Produces the visit order of a matrix for one of four traversals and emits
 * one frame per visited cell.
 *
 *  - linii:     for r, for c                 (row-major)
 *  - coloane:   for c, for r                 (column-major)
 *  - diagonale: group by (r+c) ascending,    (anti-/secondary diagonals)
 *               within a group r ascending
 *  - spirala:   top row L→R, right col T→B,  (shrinking spiral)
 *               bottom row R→L, left col B→T
 */
export const generateMatrixTraversal: FrameGenerator<
  MatrixTraversalInput,
  MatrixTraversalState
> = ({ grid, mode }) => {
  const rows = grid.length
  if (rows === 0 || grid[0].length === 0) {
    throw new Error('generateMatrixTraversal: matricea nu poate fi goală')
  }
  const cols = grid[0].length
  if (grid.some(row => row.length !== cols)) {
    throw new Error(
      'generateMatrixTraversal: toate liniile trebuie să aibă aceeași lungime',
    )
  }

  const order = buildOrder(rows, cols, mode)

  const frames: Frame<MatrixTraversalState>[] = []
  const visited: Cell[] = []
  const output: number[] = []

  const snapshot = (
    current: Cell | null,
    done: boolean,
  ): MatrixTraversalState => ({
    grid,
    mode,
    current,
    visited: visited.map(c => ({ ...c })),
    output: [...output],
    done,
  })

  frames.push({
    state: snapshot(null, false),
    explanation: `Parcurgem matricea ${MODE_LABEL[mode]}. Pornim din colțul stânga-sus, m[0][0].`,
  })

  for (let k = 0; k < order.length; k++) {
    const cell = order[k]
    const value = grid[cell.r][cell.c]
    visited.push(cell)
    output.push(value)
    const isLast = k === order.length - 1

    frames.push({
      state: snapshot(cell, isLast),
      explanation: `Vizităm m[${cell.r}][${cell.c}] = ${value}. ${describeNext(
        mode,
        order,
        k,
        rows,
        cols,
      )}`,
    })
  }

  return frames
}

function buildOrder(
  rows: number,
  cols: number,
  mode: MatrixTraversalMode,
): Cell[] {
  const order: Cell[] = []

  switch (mode) {
    case 'linii': {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) order.push({ r, c })
      }
      break
    }
    case 'coloane': {
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) order.push({ r, c })
      }
      break
    }
    case 'diagonale': {
      // group by (r+c) ascending; within group r ascending → secondary diagonals
      for (let s = 0; s <= rows + cols - 2; s++) {
        for (let r = 0; r < rows; r++) {
          const c = s - r
          if (c >= 0 && c < cols) order.push({ r, c })
        }
      }
      break
    }
    case 'spirala': {
      let top = 0
      let bottom = rows - 1
      let left = 0
      let right = cols - 1
      while (top <= bottom && left <= right) {
        // top row L→R
        for (let c = left; c <= right; c++) order.push({ r: top, c })
        top++
        // right col T→B
        for (let r = top; r <= bottom; r++) order.push({ r, c: right })
        right--
        // bottom row R→L
        if (top <= bottom) {
          for (let c = right; c >= left; c--) order.push({ r: bottom, c })
          bottom--
        }
        // left col B→T
        if (left <= right) {
          for (let r = bottom; r >= top; r--) order.push({ r, c: left })
          left++
        }
      }
      break
    }
  }

  return order
}

function describeNext(
  mode: MatrixTraversalMode,
  order: Cell[],
  k: number,
  rows: number,
  cols: number,
): string {
  const next = order[k + 1]
  if (!next) {
    return `Am terminat — am vizitat toate cele ${rows * cols} celule.`
  }
  const cur = order[k]
  const dr = next.r - cur.r
  const dc = next.c - cur.c

  switch (mode) {
    case 'linii':
      return dc > 0
        ? 'Mergem la dreapta, pe aceeași linie.'
        : 'Trecem pe linia următoare.'
    case 'coloane':
      return dr > 0
        ? 'Mergem în jos, pe aceeași coloană.'
        : 'Trecem pe coloana următoare.'
    case 'diagonale':
      return cur.r + cur.c === next.r + next.c
        ? 'Continuăm pe aceeași diagonală.'
        : 'Trecem pe diagonala următoare.'
    case 'spirala': {
      let dir: string
      if (dr === 0 && dc > 0) dir = 'Mergem la dreapta'
      else if (dr === 0 && dc < 0) dir = 'Mergem la stânga'
      else if (dc === 0 && dr > 0) dir = 'Mergem în jos'
      else if (dc === 0 && dr < 0) dir = 'Mergem în sus'
      else dir = 'Cotim'
      return `${dir} → m[${next.r}][${next.c}].`
    }
  }
}
