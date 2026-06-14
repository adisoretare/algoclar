import type { Frame, FrameGenerator } from '../types'

export type Connectivity = 4 | 8

export interface NeighborResult {
  dr: number
  dc: number
  nr: number
  nc: number
  valid: boolean
}

export interface DirectionVectorsState {
  rows: number
  cols: number
  cell: { r: number; c: number }
  connectivity: Connectivity
  dirIndex: number // index of the direction being tested, or -1 before/after
  neighbors: readonly NeighborResult[] // results accumulated so far
  done: boolean
}

export interface DirectionVectorsInput {
  rows: number
  cols: number
  cell: { r: number; c: number }
  connectivity: Connectivity
}

// 4-connectivity: sus, dreapta, jos, stânga
const DR4 = [-1, 0, 1, 0]
const DC4 = [0, 1, 0, -1]

// 8-connectivity: cele 8 celule din jur, pornind de la sus-stânga, în sensul
// acelor de ceasornic.
const DR8 = [-1, -1, 0, 1, 1, 1, 0, -1]
const DC8 = [0, 1, 1, 1, 0, -1, -1, -1]

function labelFor(dr: number, dc: number): string {
  const vertical = dr === -1 ? 'sus' : dr === 1 ? 'jos' : ''
  const horizontal = dc === -1 ? 'stânga' : dc === 1 ? 'dreapta' : ''
  if (vertical && horizontal) return `${vertical}-${horizontal}`
  return vertical || horizontal
}

/**
 * Emite un cadru pentru fiecare direcție din tabloul dr/dc. Pentru fiecare,
 * calculează vecinul (r+dr, c+dc) și verifică dacă pică în interiorul matricei
 * sau este respins de verificarea de margine.
 */
export const generateDirectionVectors: FrameGenerator<
  DirectionVectorsInput,
  DirectionVectorsState
> = ({ rows, cols, cell, connectivity }) => {
  if (rows < 1 || cols < 1 || rows > 8 || cols > 8) {
    throw new Error(
      'generateDirectionVectors: numărul de linii și coloane trebuie să fie între 1 și 8',
    )
  }
  if (connectivity !== 4 && connectivity !== 8) {
    throw new Error(
      'generateDirectionVectors: conectivitatea trebuie să fie 4 sau 8',
    )
  }
  if (
    cell.r < 0 ||
    cell.c < 0 ||
    cell.r >= rows ||
    cell.c >= cols
  ) {
    throw new Error(
      'generateDirectionVectors: celula trebuie să fie în interiorul matricei',
    )
  }

  const dr = connectivity === 4 ? DR4 : DR8
  const dc = connectivity === 4 ? DC4 : DC8

  const frames: Frame<DirectionVectorsState>[] = []
  const neighbors: NeighborResult[] = []

  const snapshot = (
    dirIndex: number,
    done: boolean,
  ): DirectionVectorsState => ({
    rows,
    cols,
    cell: { ...cell },
    connectivity,
    dirIndex,
    neighbors: neighbors.map(n => ({ ...n })),
    done,
  })

  frames.push({
    state: snapshot(-1, false),
    explanation: `Celula curentă este (${cell.r}, ${cell.c}) într-o matrice ${rows}×${cols}. Testăm cei ${connectivity} vecini folosind tablourile de direcție dr și dc.`,
  })

  for (let k = 0; k < dr.length; k++) {
    const nr = cell.r + dr[k]
    const nc = cell.c + dc[k]
    const valid = nr >= 0 && nr < rows && nc >= 0 && nc < cols
    neighbors.push({ dr: dr[k], dc: dc[k], nr, nc, valid })

    const dirText = `(${dr[k] < 0 ? '−' : ''}${Math.abs(dr[k])}, ${dc[k] < 0 ? '−' : ''}${Math.abs(dc[k])})`
    const name = labelFor(dr[k], dc[k])
    const explanation = valid
      ? `Direcția ${dirText} = ${name} → vecinul (${nr}, ${nc}), în interior ✓`
      : `Direcția ${dirText} = ${name} → vecinul (${nr}, ${nc}) iese din matrice ✗`

    frames.push({
      state: snapshot(k, false),
      explanation,
    })
  }

  const validCount = neighbors.filter(n => n.valid).length
  frames.push({
    state: snapshot(-1, true),
    explanation: `Gata. Din cei ${connectivity} vecini, ${validCount} sunt în interiorul matricei, iar ${connectivity - validCount} ies din ea. Verificarea de margine (0 ≤ nr < ${rows} și 0 ≤ nc < ${cols}) filtrează vecinii invalizi.`,
  })

  return frames
}
