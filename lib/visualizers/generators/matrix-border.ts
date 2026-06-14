import type { Frame, FrameGenerator } from '../types'

export type CellKind = 'border' | 'interior' | 'empty'

export interface MatrixBorderState {
  /** Original matrix, unchanged. */
  original: readonly (readonly number[])[]
  /** Bordered matrix, (rows+2) x (cols+2). */
  bordered: readonly (readonly number[])[]
  /** Per-cell kind for the bordered matrix. */
  kinds: readonly (readonly CellKind[])[]
  /** Phase of the construction. */
  phase: 'intro' | 'border' | 'interior' | 'done'
  /** Cell currently being set in the bordered matrix, or null. */
  current: { r: number; c: number } | null
  /** Sentinel fill value. */
  fill: number
  done: boolean
}

export interface MatrixBorderInput {
  grid: number[][]
  /** Sentinel value for the outer ring. Default 0. */
  fill: number
}

/**
 * Builds a bordered matrix of size (rows+2) x (cols+2):
 *   - outer ring  = `fill` (santinelă)
 *   - inner block = original grid, shifted by (1, 1)
 *
 * Emits: intro frame, one frame per border cell added going around the
 * ring, one frame per interior cell copied, and a final "complete" frame.
 */
export const generateMatrixBorder: FrameGenerator<
  MatrixBorderInput,
  MatrixBorderState
> = ({ grid, fill }) => {
  const rows = grid.length
  if (rows === 0 || grid[0].length === 0) {
    throw new Error('generateMatrixBorder: matricea nu poate fi goală')
  }
  const cols = grid[0].length
  if (grid.some(row => row.length !== cols)) {
    throw new Error(
      'generateMatrixBorder: toate liniile trebuie să aibă aceeași lungime',
    )
  }
  if (rows > 6 || cols > 6) {
    throw new Error('generateMatrixBorder: dimensiunea maximă este 6×6')
  }

  const br = rows + 2
  const bc = cols + 2

  const bordered = Array.from({ length: br }, () =>
    new Array<number>(bc).fill(0),
  )
  const kinds: CellKind[][] = Array.from({ length: br }, () =>
    new Array<CellKind>(bc).fill('empty'),
  )

  const frames: Frame<MatrixBorderState>[] = []

  const snapshot = (
    phase: MatrixBorderState['phase'],
    current: MatrixBorderState['current'],
    done: boolean,
  ): MatrixBorderState => ({
    original: grid,
    bordered: bordered.map(row => [...row]),
    kinds: kinds.map(row => [...row]),
    phase,
    current,
    fill,
    done,
  })

  // 1) Intro — nothing placed yet.
  frames.push({
    state: snapshot('intro', null, false),
    explanation: `Pornim de la matricea originală ${rows}×${cols}. Vrem să o „bordăm”: adăugăm un chenar de santinele în jur, ca să accesăm vecinii fără verificări de margine.`,
  })

  // 2) Border ring, going around clockwise: top → right → bottom → left.
  const ring: { r: number; c: number }[] = []
  // top row, left → right
  for (let c = 0; c < bc; c++) ring.push({ r: 0, c })
  // right col, top+1 → bottom
  for (let r = 1; r < br; r++) ring.push({ r, c: bc - 1 })
  // bottom row, right-1 → left
  for (let c = bc - 2; c >= 0; c--) ring.push({ r: br - 1, c })
  // left col, bottom-1 → top+1
  for (let r = br - 2; r >= 1; r--) ring.push({ r, c: 0 })

  for (const { r, c } of ring) {
    bordered[r][c] = fill
    kinds[r][c] = 'border'
    frames.push({
      state: snapshot('border', { r, c }, false),
      explanation: `Punem santinela ${fill} în chenar la poziția [${r}][${c}].`,
    })
  }

  // 3) Interior — copy the original grid, shifted by (1, 1).
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const r = i + 1
      const c = j + 1
      bordered[r][c] = grid[i][j]
      kinds[r][c] = 'interior'
      frames.push({
        state: snapshot('interior', { r, c }, false),
        explanation: `Copiem elementul original a[${i}][${j}] = ${grid[i][j]} în matricea bordată la [${r}][${c}].`,
      })
    }
  }

  // 4) Done.
  frames.push({
    state: snapshot('done', null, true),
    explanation: `Gata! Matricea bordată are dimensiunea ${br}×${bc}. Acum poți parcurge vecinii oricărui element interior fără să verifici marginile — santinelele (${fill}) protejează bordura.`,
  })

  return frames
}
