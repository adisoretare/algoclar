import type { Frame, FrameGenerator } from '../types'

export interface MatrixTransposeCell {
  value: number
  filled: boolean
}

export interface MatrixTransposeState {
  /** Source matrix, rows × cols. */
  grid: readonly (readonly number[])[]
  /** Transposed matrix, cols × rows; cells filled progressively. */
  transposed: readonly (readonly MatrixTransposeCell[])[]
  /** Source cell being copied this frame, or null on the intro frame. */
  src: { r: number; c: number } | null
  /** Destination cell just filled this frame, or null on the intro frame. */
  dst: { r: number; c: number } | null
  done: boolean
}

export interface MatrixTransposeInput {
  grid: number[][]
}

/**
 * Builds the transpose T where T[j][i] = grid[i][j].
 * Emits one frame per source cell copied, row-major over the source.
 */
export const generateMatrixTranspose: FrameGenerator<
  MatrixTransposeInput,
  MatrixTransposeState
> = ({ grid }) => {
  const rows = grid.length
  if (rows === 0 || grid[0].length === 0) {
    throw new Error('generateMatrixTranspose: matricea nu poate fi goală')
  }
  const cols = grid[0].length
  if (grid.some(row => row.length !== cols)) {
    throw new Error(
      'generateMatrixTranspose: toate liniile trebuie să aibă aceeași lungime',
    )
  }
  if (rows > 6 || cols > 6) {
    throw new Error('generateMatrixTranspose: dimensiunile nu pot depăși 6×6')
  }

  // Transposed has cols rows and rows columns.
  const transposed: MatrixTransposeCell[][] = Array.from(
    { length: cols },
    () =>
      Array.from({ length: rows }, () => ({ value: 0, filled: false })),
  )

  const frames: Frame<MatrixTransposeState>[] = []

  const snapshot = (
    src: { r: number; c: number } | null,
    dst: { r: number; c: number } | null,
    done: boolean,
  ): MatrixTransposeState => ({
    grid,
    transposed: transposed.map(row => row.map(cell => ({ ...cell }))),
    src,
    dst,
    done,
  })

  frames.push({
    state: snapshot(null, null, false),
    explanation: `Transpunem matricea ${rows}×${cols}: fiecare element m[i][j] se mută în t[j][i]. Parcurgem sursa linie cu linie.`,
  })

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      transposed[j][i] = { value: grid[i][j], filled: true }
      frames.push({
        state: snapshot({ r: i, c: j }, { r: j, c: i }, false),
        explanation: `m[${i}][${j}]=${grid[i][j]} se mută în t[${j}][${i}].`,
      })
    }
  }

  frames.push({
    state: snapshot(null, null, true),
    explanation: `Gata: transpusa are ${cols}×${rows} elemente. Liniile sursei au devenit coloanele transpusei.`,
  })

  return frames
}
