import type { Frame, FrameGenerator } from '../types'
import type { Graph, Edge } from './graph-types'
import { adjacency } from './graph-types'

export interface GraphDfsState {
  n: number
  edges: readonly Edge[]
  tin: readonly (number | null)[] // discovery time
  tout: readonly (number | null)[] // finish time
  stack: readonly number[] // current recursion path
  current: number | null
  activeEdge: readonly [number, number] | null
  event: 'enter' | 'exit'
  done: boolean
}

export interface GraphDfsInput {
  graph: Graph
  source: number
}

/**
 * Depth-first search with entry/exit timestamps. tin is stamped when a node is
 * first reached, tout when its whole subtree is finished. The nested intervals
 * [tin, tout] reveal the recursion structure (and ancestor relationships).
 */
export const generateGraphDfs: FrameGenerator<GraphDfsInput, GraphDfsState> = ({
  graph,
  source,
}) => {
  if (graph.n === 0) throw new Error('generateGraphDfs: graf gol')
  if (source < 0 || source >= graph.n)
    throw new Error('generateGraphDfs: sursă invalidă')

  const adj = adjacency(graph)
  const tin = new Array<number | null>(graph.n).fill(null)
  const tout = new Array<number | null>(graph.n).fill(null)
  const stack: number[] = []
  const frames: Frame<GraphDfsState>[] = []
  let timer = 0

  const snap = (
    current: number | null,
    activeEdge: [number, number] | null,
    event: 'enter' | 'exit',
    done: boolean,
  ): GraphDfsState => ({
    n: graph.n,
    edges: graph.edges,
    tin: [...tin],
    tout: [...tout],
    stack: [...stack],
    current,
    activeEdge,
    event,
    done,
  })

  const visit = (u: number, parent: number | null) => {
    tin[u] = timer++
    stack.push(u)
    frames.push({
      state: snap(u, parent !== null ? [parent, u] : null, 'enter', false),
      explanation: `Intrăm în ${u}: tin[${u}] = ${tin[u]}. Îl punem pe stiva de recursie.`,
    })
    for (const v of adj[u]) {
      if (tin[v] === null) visit(v, u)
    }
    tout[u] = timer++
    stack.pop()
    frames.push({
      state: snap(u, null, 'exit', false),
      explanation: `Ieșim din ${u}: tout[${u}] = ${tout[u]}. Subarborele lui ${u} e complet explorat.`,
    })
  }

  visit(source, null)

  frames.push({
    state: snap(null, null, 'exit', true),
    explanation: `DFS terminat. Intervalele [tin, tout] sunt imbricate: u e strămoș al lui v dacă tin[u] < tin[v] < tout[v] < tout[u].`,
  })

  return frames
}
