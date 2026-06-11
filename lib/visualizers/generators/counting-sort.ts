import type { Frame, FrameGenerator } from '../types'
import { computeFrequency } from './frequency'

export interface CountingSortState {
  array: readonly number[]    // original (unsorted) input
  freq: readonly number[]     // freq[v], built during the count phase
  output: readonly number[]   // sorted output, built during the emit phase
  phase: 'count' | 'emit' | 'done'
  countIndex: number          // index into array during count phase, else -1
  emitValue: number           // value v being emitted during emit phase, else -1
  done: boolean
}

export interface CountingSortInput {
  array: number[]
}

/**
 * Counting sort in two phases, reusing the frequency vector:
 *  1. count  — one frame per element, building freq[] (same idea as the
 *     frequency visualizer via {@link computeFrequency}).
 *  2. emit   — walk v = 0..max and push v into the output freq[v] times.
 */
export const generateCountingSort: FrameGenerator<
  CountingSortInput,
  CountingSortState
> = ({ array }) => {
  if (array.length === 0) {
    throw new Error('generateCountingSort: vectorul nu poate fi gol')
  }
  if (array.some(v => v < 0 || !Number.isInteger(v))) {
    throw new Error('generateCountingSort: valorile trebuie să fie întregi ≥ 0')
  }

  const { maxVal } = computeFrequency(array)
  const freq = new Array<number>(maxVal + 1).fill(0)
  const frames: Frame<CountingSortState>[] = []

  // Phase 1 — count
  for (let i = 0; i < array.length; i++) {
    const v = array[i]
    freq[v]++
    frames.push({
      state: {
        array,
        freq: [...freq],
        output: [],
        phase: 'count',
        countIndex: i,
        emitValue: -1,
        done: false,
      },
      explanation: `Numărăm: v[${i}] = ${v}, freq[${v}] devine ${freq[v]}.`,
    })
  }

  // Phase 2 — emit in value order
  const output: number[] = []
  for (let v = 0; v <= maxVal; v++) {
    if (freq[v] === 0) {
      frames.push({
        state: {
          array,
          freq: [...freq],
          output: [...output],
          phase: 'emit',
          countIndex: -1,
          emitValue: v,
          done: false,
        },
        explanation: `Valoarea ${v} nu apare (freq[${v}] = 0), o sărim.`,
      })
      continue
    }
    for (let c = 0; c < freq[v]; c++) {
      output.push(v)
      frames.push({
        state: {
          array,
          freq: [...freq],
          output: [...output],
          phase: 'emit',
          countIndex: -1,
          emitValue: v,
          done: false,
        },
        explanation: `Scriem valoarea ${v} (apare de ${freq[v]} ori) — copia ${c + 1}/${freq[v]}. Output: ${output.length}/${array.length}.`,
      })
    }
  }

  frames.push({
    state: {
      array,
      freq: [...freq],
      output: [...output],
      phase: 'done',
      countIndex: -1,
      emitValue: -1,
      done: true,
    },
    explanation: `Sortat în O(n + max). Fără comparații între elemente — doar numărare și reconstrucție. Merge când valorile sunt întregi mici.`,
  })

  return frames
}
