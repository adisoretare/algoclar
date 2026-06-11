import type { Frame, FrameGenerator } from '../types'

export interface SegmentTreeState {
  array: readonly number[]
  size: number // number of leaves (power of two)
  tree: readonly (number | null)[] // 1-indexed, length 2*size
  phase: 'build' | 'query' | 'done'
  current: number | null // tree node index touched
  queryRange: readonly [number, number] // [l, r] inclusive, 0-based
  coverNodes: readonly number[] // nodes whose range is fully inside the query
  result: number | null
  done: boolean
}

export interface SegmentTreeInput {
  array: number[]
  l: number // 0-based inclusive
  r: number
}

/**
 * Segment tree for range-sum. Built bottom-up: every internal node is the sum of
 * its two children. A range query splits into O(log n) maximal covering nodes.
 */
export const generateSegmentTree: FrameGenerator<
  SegmentTreeInput,
  SegmentTreeState
> = ({ array, l, r }) => {
  const n = array.length
  if (n === 0) throw new Error('generateSegmentTree: vector gol')
  if (l < 0 || r >= n || l > r)
    throw new Error('generateSegmentTree: interval invalid')

  let size = 1
  while (size < n) size *= 2
  const tree = new Array<number | null>(2 * size).fill(null)
  const frames: Frame<SegmentTreeState>[] = []

  const snap = (over: Partial<SegmentTreeState>): SegmentTreeState => ({
    array,
    size,
    tree: [...tree],
    phase: 'build',
    current: null,
    queryRange: [l, r],
    coverNodes: [],
    result: null,
    done: false,
    ...over,
  })

  // leaves
  for (let i = 0; i < size; i++) tree[size + i] = i < n ? array[i] : 0
  frames.push({
    state: snap({ phase: 'build' }),
    explanation: `Punem valorile în frunze (nivelul de jos). Completăm cu 0 până la o putere a lui 2 (${size} frunze).`,
  })

  // build internal nodes bottom-up
  for (let i = size - 1; i >= 1; i--) {
    tree[i] = (tree[2 * i] as number) + (tree[2 * i + 1] as number)
    frames.push({
      state: snap({ phase: 'build', current: i }),
      explanation: `Nodul ${i} = copil stâng (${tree[2 * i]}) + copil drept (${tree[2 * i + 1]}) = ${tree[i]}.`,
    })
  }

  // iterative range query, collecting covering nodes
  const coverNodes: number[] = []
  let result = 0
  let lo = l + size
  let hi = r + size + 1
  while (lo < hi) {
    if (lo & 1) {
      coverNodes.push(lo)
      result += tree[lo] as number
      frames.push({
        state: snap({
          phase: 'query',
          current: lo,
          coverNodes: [...coverNodes],
          result,
        }),
        explanation: `Nodul ${lo} e complet în interval → îl adăugăm (${tree[lo]}). Sumă parțială ${result}.`,
      })
      lo++
    }
    if (hi & 1) {
      hi--
      coverNodes.push(hi)
      result += tree[hi] as number
      frames.push({
        state: snap({
          phase: 'query',
          current: hi,
          coverNodes: [...coverNodes],
          result,
        }),
        explanation: `Nodul ${hi} e complet în interval → îl adăugăm (${tree[hi]}). Sumă parțială ${result}.`,
      })
    }
    lo >>= 1
    hi >>= 1
  }

  frames.push({
    state: snap({
      phase: 'done',
      coverNodes,
      result,
      done: true,
    }),
    explanation: `Suma pe [${l}, ${r}] este ${result}, din doar ${coverNodes.length} noduri (O(log n)). Update-urile sunt și ele O(log n).`,
  })

  return frames
}
