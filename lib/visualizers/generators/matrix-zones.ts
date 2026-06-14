import type { Frame, FrameGenerator } from '../types'

/**
 * The seven possible zones of a square n×n matrix split by its two diagonals.
 * Romanian labels used throughout the UI:
 *   - 'principala' — main diagonal (i == j)
 *   - 'secundara'  — secondary/anti-diagonal (i + j == n - 1)
 *   - 'nord'       — top triangle    (i < j  AND i + j < n - 1)
 *   - 'sud'        — bottom triangle (i > j  AND i + j > n - 1)
 *   - 'vest'       — left triangle   (i > j  AND i + j < n - 1)
 *   - 'est'        — right triangle  (i < j  AND i + j > n - 1)
 *   - 'centru'     — the single center cell (only when n is odd, at n/2,n/2)
 */
export type Zone =
  | 'principala'
  | 'secundara'
  | 'nord'
  | 'sud'
  | 'vest'
  | 'est'
  | 'centru'

export interface MatrixZonesCell {
  value: number
  zone: Zone
  /** True once the frame has revealed (colored) this cell's zone. */
  revealed: boolean
}

export interface MatrixZonesState {
  n: number
  /** n×n grid of classified cells with a per-cell revealed flag. */
  grid: readonly (readonly MatrixZonesCell[])[]
  /** Zone revealed by the current frame (null on the intro frame). */
  currentZone: Zone | null
  done: boolean
}

export interface MatrixZonesInput {
  /** Side of the square matrix (2..9). */
  n: number
}

/**
 * Classifies a cell (i, j) of an n×n matrix relative to BOTH diagonals.
 *
 * A cell that lies on a diagonal takes the diagonal's zone; the center cell
 * of an odd-sized matrix lies on both diagonals at once and gets 'centru'.
 * Otherwise the four open triangular regions are split by comparing i vs j
 * (above/below the main diagonal) and i + j vs n - 1 (above/below the
 * secondary diagonal):
 *   i < j & i + j < n-1 → nord (top)
 *   i > j & i + j > n-1 → sud  (bottom)
 *   i > j & i + j < n-1 → vest (left)
 *   i < j & i + j > n-1 → est  (right)
 */
export function classifyCell(i: number, j: number, n: number): Zone {
  const onMain = i === j
  const onSecondary = i + j === n - 1
  if (onMain && onSecondary) return 'centru'
  if (onMain) return 'principala'
  if (onSecondary) return 'secundara'
  if (i < j && i + j < n - 1) return 'nord'
  if (i > j && i + j > n - 1) return 'sud'
  if (i > j && i + j < n - 1) return 'vest'
  // remaining case: i < j && i + j > n - 1
  return 'est'
}

const ZONE_EXPLANATION: Record<Zone, string> = {
  principala: 'Diagonala principală: elementele cu i == j.',
  secundara: 'Diagonala secundară: elementele cu i + j == n − 1.',
  nord: 'Zona de nord (sus): i < j și i + j < n − 1.',
  est: 'Zona de est (dreapta): i < j și i + j > n − 1.',
  sud: 'Zona de sud (jos): i > j și i + j > n − 1.',
  vest: 'Zona de vest (stânga): i > j și i + j < n − 1.',
  centru: 'Centrul: pentru n impar, celula unde se intersectează cele două diagonale.',
}

/**
 * Builds the matrix and reveals its zones progressively:
 *   frame 0 — intro, nothing colored yet
 *   then one frame per zone (main diag, secondary diag, the four triangles,
 *   and the center for odd n), each frame coloring that whole zone
 *   final frame — everything revealed
 *
 * Cells hold a 1-based value = i * n + j + 1. Throws (Romanian) for n<2 or n>9.
 */
export const generateMatrixZones: FrameGenerator<
  MatrixZonesInput,
  MatrixZonesState
> = ({ n }) => {
  if (!Number.isInteger(n) || n < 2 || n > 9) {
    throw new Error(
      'generateMatrixZones: n trebuie să fie un întreg între 2 și 9.',
    )
  }

  // Classify every cell once.
  const zones: Zone[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => classifyCell(i, j, n)),
  )

  const revealed = new Set<Zone>()

  const snapshot = (
    currentZone: Zone | null,
    done: boolean,
  ): MatrixZonesState => ({
    n,
    grid: zones.map((row, i) =>
      row.map((zone, j) => ({
        value: i * n + j + 1,
        zone,
        revealed: revealed.has(zone),
      })),
    ),
    currentZone,
    done,
  })

  const frames: Frame<MatrixZonesState>[] = []

  frames.push({
    state: snapshot(null, false),
    explanation: `Matrice pătratică ${n}×${n}. Cele două diagonale o împart în zone — le colorăm pe rând.`,
  })

  // Reveal order: diagonals first, then the four triangles, then the center.
  // Only reveal zones that actually have cells for this n — small matrices
  // (e.g. 2×2) have no triangular zones, so we must not emit empty frames.
  const present = new Set<Zone>()
  for (const row of zones) for (const z of row) present.add(z)

  const order: Zone[] = [
    'principala',
    'secundara',
    'nord',
    'est',
    'sud',
    'vest',
    'centru',
  ].filter((z): z is Zone => present.has(z as Zone))

  for (const zone of order) {
    revealed.add(zone)
    frames.push({
      state: snapshot(zone, false),
      explanation: ZONE_EXPLANATION[zone],
    })
  }

  frames.push({
    state: snapshot(null, true),
    explanation: `Toate zonele sunt afișate. Fiecare celulă aparține exact unei zone, în funcție de poziția (i, j).`,
  })

  return frames
}
