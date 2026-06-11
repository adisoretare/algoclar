import type { Graph } from './generators/graph-types'

/**
 * Parses an edge list. Rows are separated by ";", each row is "u v" (unweighted)
 * or "u v w" (weighted). Node count is inferred as max id + 1. Returns null on
 * any malformed input.
 */
export function parseEdgeList(
  raw: string,
  opts: { weighted: boolean; directed: boolean },
): Graph | null {
  const rows = raw
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
  if (rows.length === 0) return null

  const edges: Graph['edges'] = []
  let maxId = 0
  for (const row of rows) {
    const parts = row.split(/\s+/).map(Number)
    if (parts.some(p => Number.isNaN(p) || p < 0 || !Number.isInteger(p)))
      return null
    if (opts.weighted) {
      if (parts.length !== 3) return null
      const [u, v, w] = parts
      edges.push({ from: u, to: v, weight: w })
      maxId = Math.max(maxId, u, v)
    } else {
      if (parts.length !== 2) return null
      const [u, v] = parts
      edges.push({ from: u, to: v })
      maxId = Math.max(maxId, u, v)
    }
  }
  return { n: maxId + 1, edges, directed: opts.directed }
}
