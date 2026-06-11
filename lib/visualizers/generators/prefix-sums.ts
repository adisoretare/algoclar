import type { Frame, FrameGenerator } from '../types'

export interface PrefixSumsState {
  array: readonly number[]
  prefix: readonly number[]   // length n+1, prefix[0] = 0, prefix[i] = a[0]+..+a[i-1]
  phase: 'build' | 'query' | 'done'
  buildIndex: number          // i in 1..n being filled during build, else -1
  queryL: number              // 0-based inclusive query bounds
  queryR: number
  queryStage: 0 | 1 | 2 | 3   // 0 idle, 1 highlight P[r+1], 2 also P[l], 3 result
  result: number | null
  done: boolean
}

export interface PrefixSumsInput {
  array: number[]
  l: number  // 0-based inclusive
  r: number  // 0-based inclusive
}

/**
 * Builds prefix[i] left-to-right, then answers one interval query
 * S(l, r) = prefix[r+1] - prefix[l] in O(1), highlighting both terms.
 */
export const generatePrefixSums: FrameGenerator<
  PrefixSumsInput,
  PrefixSumsState
> = ({ array, l, r }) => {
  if (array.length === 0) {
    throw new Error('generatePrefixSums: vectorul nu poate fi gol')
  }
  const n = array.length
  if (l < 0 || r >= n || l > r) {
    throw new Error('generatePrefixSums: interval invalid [l, r]')
  }

  const prefix = new Array<number>(n + 1).fill(0)
  const frames: Frame<PrefixSumsState>[] = []

  const base = (buildIndex: number): PrefixSumsState => ({
    array,
    prefix: [...prefix],
    phase: 'build',
    buildIndex,
    queryL: l,
    queryR: r,
    queryStage: 0,
    result: null,
    done: false,
  })

  frames.push({
    state: base(0),
    explanation: `Punem prefix[0] = 0 (suma a zero elemente). prefix are n+1 = ${n + 1} poziții.`,
  })

  for (let i = 1; i <= n; i++) {
    prefix[i] = prefix[i - 1] + array[i - 1]
    frames.push({
      state: base(i),
      explanation: `prefix[${i}] = prefix[${i - 1}] + v[${i - 1}] = ${prefix[i - 1]} + ${array[i - 1]} = ${prefix[i]}.`,
    })
  }

  const query = (queryStage: 1 | 2 | 3, result: number | null): PrefixSumsState => ({
    array,
    prefix: [...prefix],
    phase: 'query',
    buildIndex: -1,
    queryL: l,
    queryR: r,
    queryStage,
    result,
    done: false,
  })

  frames.push({
    state: query(1, null),
    explanation: `Vrem suma pe [${l}, ${r}]. Luăm prefix[r+1] = prefix[${r + 1}] = ${prefix[r + 1]} (suma primelor ${r + 1} elemente).`,
  })
  frames.push({
    state: query(2, null),
    explanation: `Scădem prefix[l] = prefix[${l}] = ${prefix[l]} (suma de dinaintea lui l), ca să rămână exact [${l}, ${r}].`,
  })

  const result = prefix[r + 1] - prefix[l]
  frames.push({
    state: { ...query(3, result), phase: 'done', done: true },
    explanation: `S(${l}, ${r}) = prefix[${r + 1}] − prefix[${l}] = ${prefix[r + 1]} − ${prefix[l]} = ${result}. Răspuns în O(1) după o pregătire O(n).`,
  })

  return frames
}
