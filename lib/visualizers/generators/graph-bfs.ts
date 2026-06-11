import type { Frame, FrameGenerator } from '../types'
import type { Graph, Edge } from './graph-types'
import { adjacency } from './graph-types'

export interface GraphBfsState {
  n: number
  edges: readonly Edge[]
  visited: readonly boolean[]
  dist: readonly (number | null)[]
  queue: readonly number[]
  current: number | null
  activeEdge: readonly [number, number] | null
  done: boolean
}

export interface GraphBfsInput {
  graph: Graph
  source: number
}

/**
 * Breadth-first search from a source: explores the graph in rings of equal
 * distance. The queue holds the current frontier; each node's dist is fixed the
 * moment it is enqueued, which is why BFS gives shortest paths in unweighted
 * graphs.
 */
export const generateGraphBfs: FrameGenerator<GraphBfsInput, GraphBfsState> = ({
  graph,
  source,
}) => {
  if (graph.n === 0) throw new Error('generateGraphBfs: graf gol')
  if (source < 0 || source >= graph.n)
    throw new Error('generateGraphBfs: sursă invalidă')

  const adj = adjacency(graph)
  const visited = new Array<boolean>(graph.n).fill(false)
  const dist = new Array<number | null>(graph.n).fill(null)
  const queue: number[] = []
  const frames: Frame<GraphBfsState>[] = []

  const snap = (
    current: number | null,
    activeEdge: [number, number] | null,
    done: boolean,
  ): GraphBfsState => ({
    n: graph.n,
    edges: graph.edges,
    visited: [...visited],
    dist: [...dist],
    queue: [...queue],
    current,
    activeEdge,
    done,
  })

  visited[source] = true
  dist[source] = 0
  queue.push(source)
  frames.push({
    state: snap(null, null, false),
    explanation: `Pornim BFS din nodul ${source}: distanța 0, îl punem în coadă.`,
  })

  while (queue.length > 0) {
    const u = queue.shift() as number
    frames.push({
      state: snap(u, null, false),
      explanation: `Scoatem din coadă nodul ${u} (distanța ${dist[u]}). Îi explorăm vecinii.`,
    })
    for (const v of adj[u]) {
      if (!visited[v]) {
        visited[v] = true
        dist[v] = (dist[u] as number) + 1
        queue.push(v)
        frames.push({
          state: snap(u, [u, v], false),
          explanation: `Vecinul ${v} e nou: distanța ${dist[v]} = ${dist[u]} + 1, îl adăugăm în coadă.`,
        })
      }
    }
  }

  frames.push({
    state: snap(null, null, true),
    explanation: `BFS terminat. Fiecare nod atins are distanța minimă (în număr de muchii) față de sursă.`,
  })

  return frames
}
