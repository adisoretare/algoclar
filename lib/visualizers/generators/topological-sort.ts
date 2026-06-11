import type { Frame, FrameGenerator } from '../types'
import type { Graph, Edge } from './graph-types'
import { adjacency } from './graph-types'

export interface TopologicalSortState {
  n: number
  edges: readonly Edge[]
  indeg: readonly number[]
  queue: readonly number[] // nodes with in-degree 0
  order: readonly number[] // topological order so far
  current: number | null
  activeEdge: readonly [number, number] | null
  hasCycle: boolean
  done: boolean
}

export interface TopologicalSortInput {
  graph: Graph // directed acyclic
}

/**
 * Kahn's algorithm: repeatedly take a node with in-degree 0, append it to the
 * order, and remove its outgoing edges (decrementing neighbours). If fewer than
 * n nodes come out, the graph had a cycle.
 */
export const generateTopologicalSort: FrameGenerator<
  TopologicalSortInput,
  TopologicalSortState
> = ({ graph }) => {
  if (graph.n === 0) throw new Error('generateTopologicalSort: graf gol')
  if (!graph.directed)
    throw new Error('generateTopologicalSort: graful trebuie să fie orientat')

  const adj = adjacency(graph)
  const indeg = new Array<number>(graph.n).fill(0)
  for (const e of graph.edges) indeg[e.to]++

  const order: number[] = []
  const queue: number[] = []
  const frames: Frame<TopologicalSortState>[] = []

  const snap = (
    current: number | null,
    activeEdge: [number, number] | null,
    done: boolean,
  ): TopologicalSortState => ({
    n: graph.n,
    edges: graph.edges,
    indeg: [...indeg],
    queue: [...queue],
    order: [...order],
    current,
    activeEdge,
    hasCycle: false,
    done,
  })

  for (let i = 0; i < graph.n; i++) if (indeg[i] === 0) queue.push(i)
  frames.push({
    state: snap(null, null, false),
    explanation: `Calculăm gradele de intrare. Nodurile cu grad 0 (fără dependențe) intră primele în coadă: ${queue.join(', ') || '(niciunul)'}.`,
  })

  while (queue.length > 0) {
    const u = queue.shift() as number
    order.push(u)
    frames.push({
      state: snap(u, null, false),
      explanation: `${u} nu mai are dependențe → îl adăugăm în ordine. Poziția ${order.length}.`,
    })
    for (const v of adj[u]) {
      indeg[v]--
      frames.push({
        state: snap(u, [u, v], false),
        explanation: `Eliminăm muchia ${u}→${v}: gradul lui ${v} scade la ${indeg[v]}.${indeg[v] === 0 ? ` Acum ${v} e liber, intră în coadă.` : ''}`,
      })
      if (indeg[v] === 0) queue.push(v)
    }
  }

  const hasCycle = order.length < graph.n
  frames.push({
    state: {
      ...snap(null, null, true),
      hasCycle,
    },
    explanation: hasCycle
      ? `Doar ${order.length}/${graph.n} noduri au putut fi ordonate → graful conține un ciclu, deci nu admite sortare topologică.`
      : `Ordine topologică validă: ${order.join(' → ')}. Orice muchie u→v are u înaintea lui v.`,
  })

  return frames
}
