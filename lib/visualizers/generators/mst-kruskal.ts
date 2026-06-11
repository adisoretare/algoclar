import type { Frame, FrameGenerator } from '../types'
import type { Graph, Edge } from './graph-types'

export interface KruskalEdge {
  from: number
  to: number
  weight: number
}

export interface MstKruskalState {
  n: number
  edges: readonly Edge[]
  sorted: readonly KruskalEdge[]
  index: number // index in sorted list being considered, -1 at done
  chosen: readonly boolean[] // chosen[i] for sorted[i]
  parent: readonly number[] // DSU
  activeEdge: readonly [number, number] | null
  accepted: boolean | null
  mstWeight: number
  done: boolean
}

export interface MstKruskalInput {
  graph: Graph // undirected weighted
}

/**
 * Kruskal's MST: sort edges by weight, then greedily add the next edge unless it
 * would form a cycle (checked with DSU). Stops once n-1 edges are chosen.
 */
export const generateMstKruskal: FrameGenerator<
  MstKruskalInput,
  MstKruskalState
> = ({ graph }) => {
  if (graph.n === 0) throw new Error('generateMstKruskal: graf gol')

  const sorted: KruskalEdge[] = graph.edges
    .map(e => ({ from: e.from, to: e.to, weight: e.weight ?? 1 }))
    .sort((a, b) => a.weight - b.weight)

  const parent = Array.from({ length: graph.n }, (_, i) => i)
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]
      x = parent[x]
    }
    return x
  }

  const chosen = new Array<boolean>(sorted.length).fill(false)
  const frames: Frame<MstKruskalState>[] = []
  let mstWeight = 0
  let count = 0

  const snap = (
    index: number,
    activeEdge: [number, number] | null,
    accepted: boolean | null,
    done: boolean,
  ): MstKruskalState => ({
    n: graph.n,
    edges: graph.edges,
    sorted: sorted.map(e => ({ ...e })),
    index,
    chosen: [...chosen],
    parent: [...parent],
    activeEdge,
    accepted,
    mstWeight,
    done,
  })

  frames.push({
    state: snap(-1, null, null, false),
    explanation: `Sortăm muchiile crescător după cost și le luăm pe rând, alegând-o pe fiecare dacă nu creează ciclu.`,
  })

  for (let i = 0; i < sorted.length; i++) {
    const e = sorted[i]
    const ra = find(e.from)
    const rb = find(e.to)
    if (ra !== rb) {
      parent[ra] = rb
      chosen[i] = true
      mstWeight += e.weight
      count++
      frames.push({
        state: snap(i, [e.from, e.to], true, false),
        explanation: `Muchia ${e.from}–${e.to} (cost ${e.weight}) leagă două componente diferite → o alegem. Cost total MST: ${mstWeight}.`,
      })
      if (count === graph.n - 1) break
    } else {
      frames.push({
        state: snap(i, [e.from, e.to], false, false),
        explanation: `Muchia ${e.from}–${e.to} (cost ${e.weight}) unește noduri deja conectate → ar crea ciclu, o respingem.`,
      })
    }
  }

  frames.push({
    state: snap(-1, null, null, true),
    explanation: `Arborele parțial de cost minim are ${count} muchii și cost total ${mstWeight}.`,
  })

  return frames
}
