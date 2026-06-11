import type { Frame, FrameGenerator } from '../types'

export interface DpTable1DState {
  table: readonly (number | null)[] // dp[0..n]
  current: number // index just filled, -1 at done
  deps: readonly number[] // indices the current cell depends on
  done: boolean
}

export interface DpTable1DInput {
  n: number
}

/**
 * Bottom-up DP table for Fibonacci: dp[i] = dp[i-1] + dp[i-2]. Each cell is
 * computed once from already-filled neighbours — no recomputation, O(n).
 */
export const generateDpTable1D: FrameGenerator<
  DpTable1DInput,
  DpTable1DState
> = ({ n }) => {
  if (n < 2 || n > 20 || !Number.isInteger(n)) {
    throw new Error('generateDpTable1D: n trebuie să fie întreg între 2 și 20')
  }

  const table: (number | null)[] = new Array(n + 1).fill(null)
  const frames: Frame<DpTable1DState>[] = []

  table[0] = 0
  frames.push({
    state: { table: [...table], current: 0, deps: [], done: false },
    explanation: `Cazuri de bază: dp[0] = 0 (al 0-lea Fibonacci).`,
  })
  table[1] = 1
  frames.push({
    state: { table: [...table], current: 1, deps: [], done: false },
    explanation: `dp[1] = 1. De aici încolo, fiecare valoare se obține din cele două dinainte.`,
  })

  for (let i = 2; i <= n; i++) {
    table[i] = (table[i - 1] as number) + (table[i - 2] as number)
    frames.push({
      state: { table: [...table], current: i, deps: [i - 1, i - 2], done: false },
      explanation: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${table[i - 1]} + ${table[i - 2]} = ${table[i]}.`,
    })
  }

  frames.push({
    state: { table: [...table], current: -1, deps: [], done: true },
    explanation: `Tabelul e complet: dp[${n}] = ${table[n]}. Am calculat fiecare stare o singură dată, refolosind rezultatele — esența programării dinamice.`,
  })

  return frames
}
