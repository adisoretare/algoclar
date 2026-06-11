import type { Frame, FrameGenerator } from '../types'

export type Coord = readonly [number, number]

export interface LeeFillState {
  grid: readonly (readonly number[])[] // 0 = liber, 1 = perete
  dist: readonly (readonly (number | null)[])[]
  current: Coord | null
  frontier: readonly Coord[] // cozile rămase
  source: Coord
  target: Coord
  reachedTarget: boolean
  done: boolean
}

export interface LeeFillInput {
  grid: number[][]
  source: Coord
  target: Coord
}

const DIRS: Coord[] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
]

/**
 * Lee's algorithm = BFS on a grid. Starting from the source, the wavefront
 * expands one ring at a time, labelling each free cell with its distance. The
 * first time the target is labelled, that label is the shortest path length.
 */
export const generateLeeFill: FrameGenerator<LeeFillInput, LeeFillState> = ({
  grid,
  source,
  target,
}) => {
  const rows = grid.length
  if (rows === 0 || grid[0].length === 0) {
    throw new Error('generateLeeFill: grila nu poate fi goală')
  }
  const cols = grid[0].length
  if (grid.some(r => r.length !== cols)) {
    throw new Error('generateLeeFill: toate liniile trebuie să aibă aceeași lungime')
  }
  const [sr, sc] = source
  const [tr, tc] = target
  if (grid[sr]?.[sc] !== 0 || grid[tr]?.[tc] !== 0) {
    throw new Error('generateLeeFill: sursa și ținta trebuie să fie pe celule libere')
  }

  const dist: (number | null)[][] = Array.from({ length: rows }, () =>
    new Array<number | null>(cols).fill(null),
  )
  const frames: Frame<LeeFillState>[] = []
  const queue: Coord[] = [[sr, sc]]
  dist[sr][sc] = 0
  let reached = false

  const snap = (current: Coord | null, done: boolean): LeeFillState => ({
    grid,
    dist: dist.map(r => [...r]),
    current,
    frontier: [...queue],
    source,
    target,
    reachedTarget: reached,
    done,
  })

  frames.push({
    state: snap(null, false),
    explanation: `Pornim din sursă (distanța 0) și o punem în coadă. BFS va eticheta celulele în ordinea distanței.`,
  })

  while (queue.length > 0) {
    const [r, c] = queue.shift() as Coord
    const added: Coord[] = []
    for (const [dr, dc] of DIRS) {
      const nr = r + dr
      const nc = c + dc
      if (
        nr >= 0 &&
        nr < rows &&
        nc >= 0 &&
        nc < cols &&
        grid[nr][nc] === 0 &&
        dist[nr][nc] === null
      ) {
        dist[nr][nc] = (dist[r][c] as number) + 1
        queue.push([nr, nc])
        added.push([nr, nc])
        if (nr === tr && nc === tc) reached = true
      }
    }
    frames.push({
      state: snap([r, c], false),
      explanation:
        added.length > 0
          ? `Din celula (${r}, ${c}) cu distanța ${dist[r][c]}, etichetăm ${added.length} vecin(i) liber(i) cu distanța ${(dist[r][c] as number) + 1}.${reached ? ' Am atins ținta!' : ''}`
          : `Celula (${r}, ${c}) nu are vecini liberi neetichetați — undă blocată aici.`,
    })
    if (reached) break
  }

  const d = dist[tr][tc]
  frames.push({
    state: snap(null, true),
    explanation:
      d !== null
        ? `Ținta a fost atinsă la distanța ${d}. Asta e lungimea celui mai scurt drum, fiindcă BFS extinde mereu cele mai apropiate celule întâi.`
        : `Ținta nu poate fi atinsă — e închisă complet de pereți.`,
  })

  return frames
}
