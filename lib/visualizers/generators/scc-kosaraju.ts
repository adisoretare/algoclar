import type { Frame, FrameGenerator } from '../types'
import type { Graph, Edge } from './graph-types'
import { adjacency } from './graph-types'

export interface SccKosarajuState {
  n: number
  edges: readonly Edge[]
  phase: 'pass1' | 'pass2' | 'done'
  order: readonly number[] // finish order from pass 1 (stack)
  comp: readonly (number | null)[] // SCC id per node
  current: number | null
  numSccs: number
  done: boolean
}

export interface SccKosarajuInput {
  graph: Graph // directed
}

/**
 * Kosaraju–Sharir for strongly connected components:
 *  pass 1 — DFS on G, pushing nodes by finish time;
 *  pass 2 — DFS on the transposed graph in reverse finish order; each tree is
 *  one SCC. Two linear passes, O(n + m).
 */
export const generateSccKosaraju: FrameGenerator<
  SccKosarajuInput,
  SccKosarajuState
> = ({ graph }) => {
  if (graph.n === 0) throw new Error('generateSccKosaraju: graf gol')
  if (!graph.directed)
    throw new Error('generateSccKosaraju: graful trebuie să fie orientat')

  const adj = adjacency(graph)
  // transpose
  const tadj: number[][] = Array.from({ length: graph.n }, () => [])
  for (const e of graph.edges) tadj[e.to].push(e.from)
  for (const l of tadj) l.sort((a, b) => a - b)

  const order: number[] = []
  const visited = new Array<boolean>(graph.n).fill(false)
  const comp = new Array<number | null>(graph.n).fill(null)
  const frames: Frame<SccKosarajuState>[] = []
  let numSccs = 0

  const snap = (
    phase: SccKosarajuState['phase'],
    current: number | null,
    done: boolean,
  ): SccKosarajuState => ({
    n: graph.n,
    edges: graph.edges,
    phase,
    order: [...order],
    comp: [...comp],
    current,
    numSccs,
    done,
  })

  // Pass 1 — order by finish time
  const dfs1 = (u: number) => {
    visited[u] = true
    frames.push({
      state: snap('pass1', u, false),
      explanation: `Pasul 1 (DFS pe graful original): vizităm ${u}.`,
    })
    for (const v of adj[u]) if (!visited[v]) dfs1(v)
    order.push(u)
    frames.push({
      state: snap('pass1', u, false),
      explanation: `${u} e terminat — îl punem pe stivă (ordinea după timpul de finalizare).`,
    })
  }
  for (let i = 0; i < graph.n; i++) if (!visited[i]) dfs1(i)

  // Pass 2 — DFS on transpose in reverse finish order
  const dfs2 = (u: number, id: number) => {
    comp[u] = id
    frames.push({
      state: snap('pass2', u, false),
      explanation: `Pasul 2 (DFS pe graful transpus): ${u} aparține componentei tare conexe ${id}.`,
    })
    for (const v of tadj[u]) if (comp[v] === null) dfs2(v, id)
  }
  for (let i = order.length - 1; i >= 0; i--) {
    const u = order[i]
    if (comp[u] === null) {
      const id = numSccs++
      dfs2(u, id)
    }
  }

  frames.push({
    state: snap('done', null, true),
    explanation: `Graful are ${numSccs} componentă(e) tare conexă(e): grupuri în care din orice nod ajungi în oricare altul respectând sensul muchiilor.`,
  })

  return frames
}
