import type { Frame, FrameGenerator } from '../types'
import type { Graph } from './graph-types'

export interface FloydWarshallState {
  n: number
  dist: readonly (number | null)[][] // null = infinity
  k: number // current intermediate node, -1 before start / at done
  i: number | null
  j: number | null
  phase: 'pivot' | 'update' | 'done'
  done: boolean
}

export interface FloydWarshallInput {
  graph: Graph // directed weighted, no negative cycle
}

/**
 * Floyd–Warshall (Roy–Floyd): all-pairs shortest paths. dist[i][j] is improved
 * by allowing intermediate node k: dist[i][j] = min(dist[i][j], dist[i][k] +
 * dist[k][j]). After trying every k, every pair is optimal. O(n³).
 */
export const generateFloydWarshall: FrameGenerator<
  FloydWarshallInput,
  FloydWarshallState
> = ({ graph }) => {
  const n = graph.n
  if (n === 0) throw new Error('generateFloydWarshall: graf gol')

  const dist: (number | null)[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : null)),
  )
  for (const e of graph.edges) {
    const w = e.weight ?? 1
    if (dist[e.from][e.to] === null || w < (dist[e.from][e.to] as number)) {
      dist[e.from][e.to] = w
      if (!graph.directed) dist[e.to][e.from] = w
    }
  }

  const frames: Frame<FloydWarshallState>[] = []
  const snap = (
    k: number,
    i: number | null,
    j: number | null,
    phase: FloydWarshallState['phase'],
    done: boolean,
  ): FloydWarshallState => ({
    n,
    dist: dist.map(row => [...row]),
    k,
    i,
    j,
    phase,
    done,
  })

  frames.push({
    state: snap(-1, null, null, 'pivot', false),
    explanation: `Pornim de la matricea muchiilor directe (∞ unde nu există muchie, 0 pe diagonală).`,
  })

  for (let k = 0; k < n; k++) {
    frames.push({
      state: snap(k, null, null, 'pivot', false),
      explanation: `Permitem nodul ${k} ca intermediar. Vedem ce perechi (i, j) se scurtează trecând prin ${k}.`,
    })
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] === null || dist[k][j] === null) continue
        const through = (dist[i][k] as number) + (dist[k][j] as number)
        if (dist[i][j] === null || through < (dist[i][j] as number)) {
          dist[i][j] = through
          frames.push({
            state: snap(k, i, j, 'update', false),
            explanation: `dist[${i}][${j}] se îmbunătățește prin ${k}: dist[${i}][${k}] + dist[${k}][${j}] = ${through}.`,
          })
        }
      }
    }
  }

  frames.push({
    state: snap(-1, null, null, 'done', true),
    explanation: `Gata: dist[i][j] e drumul minim între orice pereche de noduri. Trei bucle imbricate, O(n³).`,
  })

  return frames
}
