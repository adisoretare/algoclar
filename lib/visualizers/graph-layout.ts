export interface LayoutNode {
  id: number
  x: number
  y: number
}

/**
 * Lays out a rooted tree by depth: each level is a horizontal row, nodes spread
 * evenly within their level. `children` maps a node id to its children ids.
 */
export function layeredTreeLayout(
  n: number,
  root: number,
  children: number[][],
  size = 340,
  marginX = 30,
  marginTop = 28,
  rowGap = 64,
): LayoutNode[] {
  const depth = new Array<number>(n).fill(0)
  const order: number[][] = []
  const queue: number[] = [root]
  depth[root] = 0
  const seen = new Array<boolean>(n).fill(false)
  seen[root] = true
  while (queue.length > 0) {
    const u = queue.shift() as number
    ;(order[depth[u]] ??= []).push(u)
    for (const c of children[u]) {
      if (!seen[c]) {
        seen[c] = true
        depth[c] = depth[u] + 1
        queue.push(c)
      }
    }
  }
  const pos: LayoutNode[] = []
  order.forEach((row, d) => {
    const usable = size - 2 * marginX
    row.forEach((node, i) => {
      const x =
        row.length === 1
          ? size / 2
          : marginX + (usable * i) / (row.length - 1)
      pos[node] = { id: node, x, y: marginTop + d * rowGap }
    })
  })
  return pos
}

/**
 * Places n nodes evenly on a circle inside a [size x size] box. Node 0 sits at
 * the top, going clockwise. Returned coordinates already account for a margin so
 * node circles stay inside the viewBox.
 */
export function circularLayout(n: number, size = 340, margin = 36): LayoutNode[] {
  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - margin
  if (n === 1) return [{ id: 0, x: cx, y: cy }]
  return Array.from({ length: n }, (_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n
    return {
      id: i,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
  })
}
