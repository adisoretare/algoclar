import type { Frame, FrameGenerator } from '../types'
import type { Graph, Edge } from './graph-types'

export interface BellmanFordState {
  n: number
  edges: readonly Edge[]
  dist: readonly (number | null)[]
  iteration: number // 1..n-1
  activeEdge: readonly [number, number] | null
  updated: boolean | null
  negativeCycle: boolean
  done: boolean
}

export interface BellmanFordInput {
  graph: Graph // directed, weights may be negative
  source: number
}

/**
 * Bellman–Ford: relax every edge, n-1 times. Because each pass extends shortest
 * paths by one more edge, n-1 passes suffice. A relaxation still possible on an
 * n-th pass means a negative cycle. Handles negative weights, unlike Dijkstra.
 */
export const generateBellmanFord: FrameGenerator<
  BellmanFordInput,
  BellmanFordState
> = ({ graph, source }) => {
  if (graph.n === 0) throw new Error('generateBellmanFord: graf gol')
  if (source < 0 || source >= graph.n)
    throw new Error('generateBellmanFord: sursă invalidă')

  const dist = new Array<number | null>(graph.n).fill(null)
  const frames: Frame<BellmanFordState>[] = []

  const snap = (
    iteration: number,
    activeEdge: [number, number] | null,
    updated: boolean | null,
    negativeCycle: boolean,
    done: boolean,
  ): BellmanFordState => ({
    n: graph.n,
    edges: graph.edges,
    dist: [...dist],
    iteration,
    activeEdge,
    updated,
    negativeCycle,
    done,
  })

  dist[source] = 0
  frames.push({
    state: snap(0, null, null, false, false),
    explanation: `Pornim din ${source} (distanță 0). Vom relaxa toate muchiile de ${graph.n - 1} ori.`,
  })

  for (let iter = 1; iter <= graph.n - 1; iter++) {
    let anyUpdate = false
    for (const e of graph.edges) {
      if (dist[e.from] === null) continue
      const nd = (dist[e.from] as number) + (e.weight ?? 1)
      const improved = dist[e.to] === null || nd < (dist[e.to] as number)
      if (improved) {
        dist[e.to] = nd
        anyUpdate = true
        frames.push({
          state: snap(iter, [e.from, e.to], true, false, false),
          explanation: `Iterația ${iter}: relaxăm ${e.from}→${e.to} (cost ${e.weight ?? 1}). dist[${e.to}] devine ${nd}.`,
        })
      }
    }
    if (!anyUpdate) {
      frames.push({
        state: snap(iter, null, false, false, false),
        explanation: `Iterația ${iter}: nicio îmbunătățire — distanțele s-au stabilizat, ne putem opri mai devreme.`,
      })
      break
    }
  }

  // Negative-cycle check
  let negativeCycle = false
  for (const e of graph.edges) {
    if (dist[e.from] === null) continue
    if ((dist[e.from] as number) + (e.weight ?? 1) < (dist[e.to] as number)) {
      negativeCycle = true
      break
    }
  }

  frames.push({
    state: snap(graph.n - 1, null, null, negativeCycle, true),
    explanation: negativeCycle
      ? `O muchie încă se poate relaxa după ${graph.n - 1} iterații → există un ciclu negativ; drumurile minime nu sunt bine definite.`
      : `Gata. dist[] conține drumurile minime din ${source}, chiar și cu muchii de cost negativ.`,
  })

  return frames
}
