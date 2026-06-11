import type { Frame, FrameGenerator } from '../types'

export interface RmqState {
  array: readonly number[]
  sparse: readonly (readonly (number | null)[])[] // sparse[k][i] = min over [i, i+2^k)
  phase: 'build' | 'query' | 'done'
  buildK: number | null
  buildI: number | null
  queryRange: readonly [number, number] | null
  queryK: number | null
  queryCells: readonly (readonly [number, number])[] // [k,i] cells used
  result: number | null
  done: boolean
}

export interface RmqInput {
  array: number[]
  l: number // 0-based inclusive
  r: number
}

/**
 * Range Minimum Query via a sparse table. sparse[k][i] is the min of the block
 * of length 2^k starting at i, built by doubling. Any query [l, r] is the min of
 * two overlapping power-of-two blocks — answered in O(1).
 */
export const generateRmq: FrameGenerator<RmqInput, RmqState> = ({
  array,
  l,
  r,
}) => {
  const n = array.length
  if (n === 0) throw new Error('generateRmq: vector gol')
  if (l < 0 || r >= n || l > r) throw new Error('generateRmq: interval invalid')

  const LOG = Math.floor(Math.log2(n)) + 1
  const sparse: (number | null)[][] = Array.from({ length: LOG }, () =>
    new Array<number | null>(n).fill(null),
  )
  const frames: Frame<RmqState>[] = []

  const snap = (over: Partial<RmqState>): RmqState => ({
    array,
    sparse: sparse.map(row => [...row]),
    phase: 'build',
    buildK: null,
    buildI: null,
    queryRange: [l, r],
    queryK: null,
    queryCells: [],
    result: null,
    done: false,
    ...over,
  })

  for (let i = 0; i < n; i++) sparse[0][i] = array[i]
  frames.push({
    state: snap({ phase: 'build', buildK: 0 }),
    explanation: `Nivelul 0: fiecare bloc de lungime 1 e chiar valoarea din vector.`,
  })

  for (let k = 1; k < LOG; k++) {
    for (let i = 0; i + (1 << k) <= n; i++) {
      const left = sparse[k - 1][i] as number
      const right = sparse[k - 1][i + (1 << (k - 1))] as number
      sparse[k][i] = Math.min(left, right)
      frames.push({
        state: snap({ phase: 'build', buildK: k, buildI: i }),
        explanation: `sparse[${k}][${i}] = min(bloc de la ${i}, bloc de la ${i + (1 << (k - 1))}) = min(${left}, ${right}) = ${sparse[k][i]}.`,
      })
    }
  }

  // query
  const len = r - l + 1
  const k = Math.floor(Math.log2(len))
  const cellA: [number, number] = [k, l]
  const cellB: [number, number] = [k, r - (1 << k) + 1]
  const a = sparse[k][l] as number
  const b = sparse[k][r - (1 << k) + 1] as number
  const result = Math.min(a, b)
  frames.push({
    state: snap({
      phase: 'query',
      queryK: k,
      queryCells: [cellA, cellB],
      result,
    }),
    explanation: `Interogare [${l}, ${r}] (lungime ${len}): luăm două blocuri de lungime ${1 << k} care acoperă tot intervalul — sparse[${k}][${l}] = ${a} și sparse[${k}][${r - (1 << k) + 1}] = ${b}.`,
  })

  frames.push({
    state: snap({
      phase: 'done',
      queryK: k,
      queryCells: [cellA, cellB],
      result,
      done: true,
    }),
    explanation: `Minimul pe [${l}, ${r}] = min(${a}, ${b}) = ${result}. Răspuns în O(1), fiindcă blocurile se pot suprapune fără să strice minimul.`,
  })

  return frames
}
