import type { Frame, FrameGenerator } from '../types'

export type Cell = readonly [number, number]

export interface KnapsackItem {
  w: number
  v: number
}

export interface KnapsackState {
  items: readonly KnapsackItem[]
  capacity: number
  table: readonly (number | null)[][] // (n+1) x (capacity+1)
  curItem: number // 1-based row, -1 at done
  curCap: number // column, -1 at done
  deps: readonly Cell[]
  took: boolean // whether taking the item won this cell
  result: number | null
  done: boolean
}

export interface KnapsackInput {
  items: KnapsackItem[]
  capacity: number
}

/**
 * 0/1 knapsack DP table. dp[i][c] = best value using the first i items within
 * capacity c. For each cell we choose: skip item i (dp[i-1][c]) or take it
 * (dp[i-1][c-w] + v) when it fits. Bottom-right is the optimum.
 */
export const generateKnapsack: FrameGenerator<KnapsackInput, KnapsackState> = ({
  items,
  capacity,
}) => {
  if (items.length === 0) {
    throw new Error('generateKnapsack: nevoie de cel puțin un obiect')
  }
  if (capacity < 1 || capacity > 14) {
    throw new Error('generateKnapsack: capacitatea trebuie să fie între 1 și 14')
  }
  if (items.some(it => it.w < 0 || it.v < 0)) {
    throw new Error('generateKnapsack: greutățile și valorile trebuie să fie ≥ 0')
  }

  const n = items.length
  const table: (number | null)[][] = Array.from({ length: n + 1 }, () =>
    new Array<number | null>(capacity + 1).fill(null),
  )
  for (let c = 0; c <= capacity; c++) table[0][c] = 0
  for (let i = 0; i <= n; i++) table[i][0] = 0

  const frames: Frame<KnapsackState>[] = []

  const snap = (
    curItem: number,
    curCap: number,
    deps: Cell[],
    took: boolean,
    result: number | null,
    done: boolean,
  ): KnapsackState => ({
    items,
    capacity,
    table: table.map(row => [...row]),
    curItem,
    curCap,
    deps,
    took,
    result,
    done,
  })

  frames.push({
    state: snap(-1, -1, [], false, null, false),
    explanation: `Rândul 0 (niciun obiect) și coloana 0 (capacitate 0) sunt 0. Adăugăm obiectele unul câte unul.`,
  })

  for (let i = 1; i <= n; i++) {
    const { w, v } = items[i - 1]
    for (let c = 1; c <= capacity; c++) {
      const skip = table[i - 1][c] as number
      if (w <= c) {
        const take = (table[i - 1][c - w] as number) + v
        const took = take > skip
        table[i][c] = Math.max(skip, take)
        frames.push({
          state: snap(
            i,
            c,
            took ? [[i - 1, c], [i - 1, c - w]] : [[i - 1, c]],
            took,
            null,
            false,
          ),
          explanation: took
            ? `Obiectul ${i} (g=${w}, v=${v}) încape în ${c}. Îl luăm: ${table[i - 1][c - w]} + ${v} = ${take} > ${skip}. dp[${i}][${c}] = ${take}.`
            : `Obiectul ${i} (g=${w}, v=${v}) încape, dar nu merită: îl sărim. dp[${i}][${c}] = ${skip}.`,
        })
      } else {
        table[i][c] = skip
        frames.push({
          state: snap(i, c, [[i - 1, c]], false, null, false),
          explanation: `Obiectul ${i} (g=${w}) nu încape în capacitatea ${c} → copiem de sus: dp[${i}][${c}] = ${skip}.`,
        })
      }
    }
  }

  frames.push({
    state: snap(-1, -1, [], false, table[n][capacity], true),
    explanation: `Valoarea maximă pentru capacitatea ${capacity} este ${table[n][capacity]} (colțul dreapta-jos). Fiecare obiect e fie luat, fie lăsat — 0/1.`,
  })

  return frames
}
