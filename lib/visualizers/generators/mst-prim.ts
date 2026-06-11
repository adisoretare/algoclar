import type { Frame, FrameGenerator } from '../types'
import type { Graph, Edge } from './graph-types'
import { weightedAdjacency } from './graph-types'

export interface MstPrimState {
  n: number
  edges: readonly Edge[]
  inTree: readonly boolean[]
  key: readonly (number | null)[] // cheapest edge connecting node to the tree
  parent: readonly (number | null)[] // tree parent
  current: number | null
  activeEdge: readonly [number, number] | null
  mstWeight: number
  done: boolean
}

export interface MstPrimInput {
  graph: Graph // undirected weighted, connected
  start: number
}

/**
 * Prim's MST: grow a single tree from a start node, repeatedly adding the
 * cheapest edge that connects a new node to the tree (tracked in key[]).
 */
export const generateMstPrim: FrameGenerator<MstPrimInput, MstPrimState> = ({
  graph,
  start,
}) => {
  if (graph.n === 0) throw new Error('generateMstPrim: graf gol')
  if (start < 0 || start >= graph.n)
    throw new Error('generateMstPrim: nod de start invalid')

  const adj = weightedAdjacency(graph)
  const inTree = new Array<boolean>(graph.n).fill(false)
  const key = new Array<number | null>(graph.n).fill(null)
  const parent = new Array<number | null>(graph.n).fill(null)
  const frames: Frame<MstPrimState>[] = []
  let mstWeight = 0

  const snap = (
    current: number | null,
    activeEdge: [number, number] | null,
    done: boolean,
  ): MstPrimState => ({
    n: graph.n,
    edges: graph.edges,
    inTree: [...inTree],
    key: [...key],
    parent: [...parent],
    current,
    activeEdge,
    mstWeight,
    done,
  })

  key[start] = 0
  frames.push({
    state: snap(null, null, false),
    explanation: `Pornim arborele din nodul ${start} (cost 0). Vom adăuga mereu cea mai ieftină muchie spre un nod nou.`,
  })

  for (let iter = 0; iter < graph.n; iter++) {
    let u = -1
    let best = Infinity
    for (let i = 0; i < graph.n; i++) {
      if (!inTree[i] && key[i] !== null && (key[i] as number) < best) {
        best = key[i] as number
        u = i
      }
    }
    if (u === -1) break
    inTree[u] = true
    if (parent[u] !== null) mstWeight += key[u] as number
    frames.push({
      state: snap(u, parent[u] !== null ? [parent[u] as number, u] : null, false),
      explanation:
        parent[u] !== null
          ? `Adăugăm ${u} prin muchia ${parent[u]}–${u} (cost ${key[u]}). Cost total: ${mstWeight}.`
          : `Adăugăm nodul de start ${u}.`,
    })
    for (const { to, weight } of adj[u]) {
      if (!inTree[to] && (key[to] === null || weight < (key[to] as number))) {
        key[to] = weight
        parent[to] = u
        frames.push({
          state: snap(u, [u, to], false),
          explanation: `Muchia ${u}–${to} (cost ${weight}) e cea mai ieftină legătură de până acum spre ${to} → o reținem.`,
        })
      }
    }
  }

  frames.push({
    state: snap(null, null, true),
    explanation: `MST complet, cost total ${mstWeight}. Spre deosebire de Kruskal, Prim crește un singur arbore din interior.`,
  })

  return frames
}
