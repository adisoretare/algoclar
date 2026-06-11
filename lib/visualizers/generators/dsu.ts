import type { Frame, FrameGenerator } from '../types'

export type DsuOp =
  | { type: 'union'; a: number; b: number }
  | { type: 'find'; a: number }

export interface DsuState {
  n: number
  parent: readonly number[]
  rank: readonly number[]
  op: 'union' | 'find' | null
  a: number | null
  b: number | null
  highlightPath: readonly number[] // nodes walked during a find / compression
  roots: readonly [number, number] | null // roots in a union
  merged: boolean | null
  result: number | null // find result
  done: boolean
}

export interface DsuInput {
  n: number
  operations: DsuOp[]
}

/**
 * Disjoint Set Union with union by rank and path compression. find() walks to
 * the root then re-points every node on the path straight to it, flattening the
 * tree so future queries are almost O(1).
 */
export const generateDsu: FrameGenerator<DsuInput, DsuState> = ({
  n,
  operations,
}) => {
  if (n < 1) throw new Error('generateDsu: n trebuie să fie ≥ 1')

  const parent = Array.from({ length: n }, (_, i) => i)
  const rank = new Array<number>(n).fill(0)
  const frames: Frame<DsuState>[] = []

  const snap = (over: Partial<DsuState>): DsuState => ({
    n,
    parent: [...parent],
    rank: [...rank],
    op: null,
    a: null,
    b: null,
    highlightPath: [],
    roots: null,
    merged: null,
    result: null,
    done: false,
    ...over,
  })

  const findPath = (x: number): number[] => {
    const path: number[] = []
    let cur = x
    while (parent[cur] !== cur) {
      path.push(cur)
      cur = parent[cur]
    }
    path.push(cur)
    return path
  }

  const compress = (path: number[]) => {
    const root = path[path.length - 1]
    for (const node of path) parent[node] = root
  }

  frames.push({
    state: snap({}),
    explanation: `La început fiecare element e propria mulțime (își e propriul părinte).`,
  })

  for (const operation of operations) {
    if (operation.type === 'find') {
      const path = findPath(operation.a)
      const root = path[path.length - 1]
      frames.push({
        state: snap({ op: 'find', a: operation.a, highlightPath: path, result: root }),
        explanation: `find(${operation.a}): urcăm la rădăcină pe drumul ${path.join(' → ')}. Rădăcina (mulțimea) este ${root}.`,
      })
      compress(path)
      frames.push({
        state: snap({ op: 'find', a: operation.a, highlightPath: path, result: root }),
        explanation: `Compresie de drum: legăm fiecare nod de pe drum direct la rădăcina ${root}. Următoarele căutări vor fi instant.`,
      })
    } else {
      const pa = findPath(operation.a)
      const pb = findPath(operation.b)
      compress(pa)
      compress(pb)
      const ra = pa[pa.length - 1]
      const rb = pb[pb.length - 1]
      if (ra === rb) {
        frames.push({
          state: snap({ op: 'union', a: operation.a, b: operation.b, roots: [ra, rb], merged: false }),
          explanation: `union(${operation.a}, ${operation.b}): au deja aceeași rădăcină (${ra}) — sunt în aceeași mulțime, nu facem nimic.`,
        })
        continue
      }
      // union by rank
      let lo = ra
      let hi = rb
      if (rank[lo] > rank[hi]) [lo, hi] = [hi, lo]
      parent[lo] = hi
      if (rank[lo] === rank[hi]) rank[hi]++
      frames.push({
        state: snap({ op: 'union', a: operation.a, b: operation.b, roots: [ra, rb], merged: true }),
        explanation: `union(${operation.a}, ${operation.b}): rădăcinile ${ra} și ${rb} diferă. Legăm arborele mai mic sub cel mai mare (după rang): ${lo} devine copilul lui ${hi}.`,
      })
    }
  }

  frames.push({
    state: snap({ done: true }),
    explanation: `Rang + compresie de drum fac operațiile aproape O(1) amortizat — structura ideală pentru a urmări mulțimi care se unesc.`,
  })

  return frames
}
