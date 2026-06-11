export interface Edge {
  from: number
  to: number
  weight?: number
}

export interface Graph {
  n: number
  edges: Edge[]
  directed: boolean
}

/** Plain adjacency (neighbour ids), sorted ascending for deterministic order. */
export function adjacency(g: Graph): number[][] {
  const adj: number[][] = Array.from({ length: g.n }, () => [])
  for (const e of g.edges) {
    adj[e.from].push(e.to)
    if (!g.directed) adj[e.to].push(e.from)
  }
  for (const list of adj) list.sort((a, b) => a - b)
  return adj
}

/** Weighted adjacency, sorted by neighbour id. */
export function weightedAdjacency(
  g: Graph,
): { to: number; weight: number }[][] {
  const adj: { to: number; weight: number }[][] = Array.from(
    { length: g.n },
    () => [],
  )
  for (const e of g.edges) {
    adj[e.from].push({ to: e.to, weight: e.weight ?? 1 })
    if (!g.directed) adj[e.to].push({ to: e.from, weight: e.weight ?? 1 })
  }
  for (const list of adj) list.sort((a, b) => a.to - b.to)
  return adj
}
