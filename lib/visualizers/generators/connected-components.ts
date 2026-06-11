import type { Frame, FrameGenerator } from '../types'
import type { Graph, Edge } from './graph-types'
import { adjacency } from './graph-types'

export interface ConnectedComponentsState {
  n: number
  edges: readonly Edge[]
  comp: readonly (number | null)[] // component id per node
  current: number | null
  activeEdge: readonly [number, number] | null
  numComponents: number
  done: boolean
}

export interface ConnectedComponentsInput {
  graph: Graph // undirected
}

/**
 * Counts connected components of an undirected graph: scan nodes, and from each
 * unvisited node run a BFS that paints its whole component with a new id.
 */
export const generateConnectedComponents: FrameGenerator<
  ConnectedComponentsInput,
  ConnectedComponentsState
> = ({ graph }) => {
  if (graph.n === 0) throw new Error('generateConnectedComponents: graf gol')

  const adj = adjacency(graph)
  const comp = new Array<number | null>(graph.n).fill(null)
  const frames: Frame<ConnectedComponentsState>[] = []
  let numComponents = 0

  const snap = (
    current: number | null,
    activeEdge: [number, number] | null,
    done: boolean,
  ): ConnectedComponentsState => ({
    n: graph.n,
    edges: graph.edges,
    comp: [...comp],
    current,
    activeEdge,
    numComponents,
    done,
  })

  for (let s = 0; s < graph.n; s++) {
    if (comp[s] !== null) continue
    const id = numComponents++
    comp[s] = id
    const queue = [s]
    frames.push({
      state: snap(s, null, false),
      explanation: `Nodul ${s} nu e încă în nicio componentă → deschidem componenta ${id} și pornim o parcurgere de aici.`,
    })
    while (queue.length > 0) {
      const u = queue.shift() as number
      for (const v of adj[u]) {
        if (comp[v] === null) {
          comp[v] = id
          queue.push(v)
          frames.push({
            state: snap(v, [u, v], false),
            explanation: `${v} e conectat la componenta ${id} prin muchia ${u}–${v}.`,
          })
        }
      }
    }
  }

  frames.push({
    state: snap(null, null, true),
    explanation: `Graful are ${numComponents} componentă(e) conexă(e) — grupuri de noduri legate între ele, dar separate de restul.`,
  })

  return frames
}
