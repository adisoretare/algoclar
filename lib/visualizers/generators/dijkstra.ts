import type { Frame, FrameGenerator } from '../types'
import type { Graph, Edge } from './graph-types'
import { weightedAdjacency } from './graph-types'

export interface DijkstraState {
  n: number
  edges: readonly Edge[]
  dist: readonly (number | null)[]
  visited: readonly boolean[]
  pq: readonly { node: number; dist: number }[] // unsettled nodes with finite dist
  current: number | null
  activeEdge: readonly [number, number] | null
  relaxed: boolean | null
  done: boolean
}

export interface DijkstraInput {
  graph: Graph // non-negative weights
  source: number
}

/**
 * Dijkstra with a priority queue: always settle the unvisited node with the
 * smallest tentative distance, then relax its edges. Non-negative weights are
 * what guarantee that a settled distance is final.
 */
export const generateDijkstra: FrameGenerator<DijkstraInput, DijkstraState> = ({
  graph,
  source,
}) => {
  if (graph.n === 0) throw new Error('generateDijkstra: graf gol')
  if (source < 0 || source >= graph.n)
    throw new Error('generateDijkstra: sursă invalidă')
  if (graph.edges.some(e => (e.weight ?? 1) < 0))
    throw new Error('generateDijkstra: ponderile trebuie să fie ≥ 0')

  const adj = weightedAdjacency(graph)
  const dist = new Array<number | null>(graph.n).fill(null)
  const visited = new Array<boolean>(graph.n).fill(false)
  const frames: Frame<DijkstraState>[] = []

  const pqList = () =>
    dist
      .map((d, node) => ({ node, dist: d }))
      .filter((x): x is { node: number; dist: number } => x.dist !== null && !visited[x.node])
      .sort((a, b) => a.dist - b.dist)

  const snap = (
    current: number | null,
    activeEdge: [number, number] | null,
    relaxed: boolean | null,
    done: boolean,
  ): DijkstraState => ({
    n: graph.n,
    edges: graph.edges,
    dist: [...dist],
    visited: [...visited],
    pq: pqList(),
    current,
    activeEdge,
    relaxed,
    done,
  })

  dist[source] = 0
  frames.push({
    state: snap(null, null, null, false),
    explanation: `Pornim din ${source} cu distanța 0; restul au distanță ∞ (necunoscută).`,
  })

  for (let iter = 0; iter < graph.n; iter++) {
    // pick unvisited node with smallest finite dist
    let u = -1
    let best = Infinity
    for (let i = 0; i < graph.n; i++) {
      if (!visited[i] && dist[i] !== null && (dist[i] as number) < best) {
        best = dist[i] as number
        u = i
      }
    }
    if (u === -1) break
    visited[u] = true
    frames.push({
      state: snap(u, null, null, false),
      explanation: `Extragem din coada de priorități nodul ${u} cu distanța ${dist[u]} — e definitivă. Îi relaxăm muchiile.`,
    })
    for (const { to, weight } of adj[u]) {
      if (visited[to]) continue
      const nd = (dist[u] as number) + weight
      const improved = dist[to] === null || nd < (dist[to] as number)
      if (improved) dist[to] = nd
      frames.push({
        state: snap(u, [u, to], improved, false),
        explanation: improved
          ? `Relaxăm ${u}→${to}: ${dist[u]} + ${weight} = ${nd}, mai bun decât înainte → actualizăm dist[${to}] = ${nd}.`
          : `Muchia ${u}→${to}: ${dist[u]} + ${weight} = ${nd} nu îmbunătățește dist[${to}] = ${dist[to]}. Lăsăm.`,
      })
    }
  }

  frames.push({
    state: snap(null, null, null, true),
    explanation: `Dijkstra terminat. dist[] conține drumurile minime de la ${source} la fiecare nod.`,
  })

  return frames
}
