import type { Frame, FrameGenerator } from '../types'

export interface FenwickState {
  array: readonly number[] // original values (displayed 1-indexed)
  tree: readonly number[] // BIT, indices 1..n (index 0 unused)
  phase: 'build' | 'query' | 'done'
  current: number | null // BIT index currently touched
  touched: readonly number[] // all indices visited in the current op
  queryIndex: number | null // prefix length being queried
  accumulated: number | null
  done: boolean
}

export interface FenwickInput {
  array: number[]
  queryPrefix: number // 1-indexed prefix length to query
}

/**
 * Fenwick tree (Binary Indexed Tree). Each index covers a range whose length is
 * the lowest set bit (i & -i). Updates climb with i += i&-i; prefix sums descend
 * with i -= i&-i. Both run in O(log n).
 */
export const generateFenwick: FrameGenerator<FenwickInput, FenwickState> = ({
  array,
  queryPrefix,
}) => {
  const n = array.length
  if (n === 0) throw new Error('generateFenwick: vector gol')
  if (queryPrefix < 1 || queryPrefix > n)
    throw new Error('generateFenwick: prefix invalid')

  const tree = new Array<number>(n + 1).fill(0)
  const frames: Frame<FenwickState>[] = []

  const snap = (over: Partial<FenwickState>): FenwickState => ({
    array,
    tree: [...tree],
    phase: 'build',
    current: null,
    touched: [],
    queryIndex: null,
    accumulated: null,
    done: false,
    ...over,
  })

  frames.push({
    state: snap({}),
    explanation: `Construim arborele indexat binar adăugând fiecare valoare. Indexul i „acoperă” ${'`i & -i`'} poziții.`,
  })

  // Build via point updates
  for (let idx = 0; idx < n; idx++) {
    const touched: number[] = []
    let i = idx + 1
    while (i <= n) {
      tree[i] += array[idx]
      touched.push(i)
      i += i & -i
    }
    frames.push({
      state: snap({ phase: 'build', current: idx + 1, touched }),
      explanation: `Adăugăm v[${idx + 1}] = ${array[idx]} în pozițiile BIT ${touched.join(', ')} (urcăm cu i += i & -i).`,
    })
  }

  // Prefix-sum query
  let sum = 0
  const touched: number[] = []
  let i = queryPrefix
  while (i > 0) {
    sum += tree[i]
    touched.push(i)
    frames.push({
      state: snap({
        phase: 'query',
        current: i,
        touched: [...touched],
        queryIndex: queryPrefix,
        accumulated: sum,
      }),
      explanation: `prefix(${queryPrefix}): adăugăm tree[${i}] = ${tree[i]}. Sumă parțială ${sum}. Coborâm: i −= i & -i → ${i - (i & -i)}.`,
    })
    i -= i & -i
  }

  frames.push({
    state: snap({
      phase: 'done',
      queryIndex: queryPrefix,
      accumulated: sum,
      touched,
      done: true,
    }),
    explanation: `Suma primelor ${queryPrefix} elemente este ${sum}, obținută în doar ${touched.length} pași (O(log n)).`,
  })

  return frames
}
