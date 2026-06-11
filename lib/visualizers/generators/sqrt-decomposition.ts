import type { Frame, FrameGenerator } from '../types'

export interface SqrtDecompState {
  array: readonly number[]
  blockSize: number
  blockSum: readonly number[]
  phase: 'build' | 'query' | 'done'
  current: number | null // index or block being processed
  currentKind: 'cell' | 'block' | null
  queryRange: readonly [number, number] | null
  coveredIndices: readonly number[]
  coveredBlocks: readonly number[]
  accumulated: number | null
  result: number | null
  done: boolean
}

export interface SqrtDecompInput {
  array: number[]
  l: number // 0-based inclusive
  r: number
}

/**
 * Square-root decomposition: split the array into blocks of size ~√n and
 * precompute each block's sum. A range query adds whole-block sums for the fully
 * covered middle and individual cells for the partial ends — O(√n) per query.
 */
export const generateSqrtDecomposition: FrameGenerator<
  SqrtDecompInput,
  SqrtDecompState
> = ({ array, l, r }) => {
  const n = array.length
  if (n === 0) throw new Error('generateSqrtDecomposition: vector gol')
  if (l < 0 || r >= n || l > r)
    throw new Error('generateSqrtDecomposition: interval invalid')

  const blockSize = Math.max(1, Math.floor(Math.sqrt(n)))
  const numBlocks = Math.ceil(n / blockSize)
  const blockSum = new Array<number>(numBlocks).fill(0)
  const frames: Frame<SqrtDecompState>[] = []

  const snap = (over: Partial<SqrtDecompState>): SqrtDecompState => ({
    array,
    blockSize,
    blockSum: [...blockSum],
    phase: 'build',
    current: null,
    currentKind: null,
    queryRange: [l, r],
    coveredIndices: [],
    coveredBlocks: [],
    accumulated: null,
    result: null,
    done: false,
    ...over,
  })

  // build block sums
  for (let b = 0; b < numBlocks; b++) {
    for (let i = b * blockSize; i < Math.min((b + 1) * blockSize, n); i++) {
      blockSum[b] += array[i]
    }
    frames.push({
      state: snap({ phase: 'build', current: b, currentKind: 'block' }),
      explanation: `Blocul ${b} (pozițiile ${b * blockSize}–${Math.min((b + 1) * blockSize, n) - 1}) are suma ${blockSum[b]}.`,
    })
  }

  // query
  const coveredIndices: number[] = []
  const coveredBlocks: number[] = []
  let acc = 0
  let i = l
  while (i <= r) {
    if (i % blockSize === 0 && i + blockSize - 1 <= r) {
      const b = i / blockSize
      acc += blockSum[b]
      coveredBlocks.push(b)
      frames.push({
        state: snap({
          phase: 'query',
          current: b,
          currentKind: 'block',
          coveredIndices: [...coveredIndices],
          coveredBlocks: [...coveredBlocks],
          accumulated: acc,
        }),
        explanation: `Blocul ${b} încape întreg în interval → adăugăm suma lui ${blockSum[b]} dintr-o dată și sărim peste el. Total ${acc}.`,
      })
      i += blockSize
    } else {
      acc += array[i]
      coveredIndices.push(i)
      frames.push({
        state: snap({
          phase: 'query',
          current: i,
          currentKind: 'cell',
          coveredIndices: [...coveredIndices],
          coveredBlocks: [...coveredBlocks],
          accumulated: acc,
        }),
        explanation: `Poziția ${i} e într-un bloc parțial → adăugăm v[${i}] = ${array[i]} individual. Total ${acc}.`,
      })
      i++
    }
  }

  frames.push({
    state: snap({
      phase: 'done',
      coveredIndices,
      coveredBlocks,
      accumulated: acc,
      result: acc,
      done: true,
    }),
    explanation: `Suma pe [${l}, ${r}] = ${acc}. Blocuri întregi + capete parțiale → O(√n) pe interogare, fără arbore.`,
  })

  return frames
}
