import type { Frame, FrameGenerator } from '../types'

export interface FrequencyState {
  array: readonly number[]
  freq: readonly number[]   // freq[v] = how many times value v appeared so far
  currentIndex: number      // index in array being counted; -1 when done
  countedValue: number      // value v = array[currentIndex] just bumped; -1 when done
  done: boolean
}

export interface FrequencyInput {
  array: number[]
}

/**
 * Builds a frequency vector freq[0..max] for an array of non-negative integers.
 * Shared with counting-sort, which reuses {@link computeFrequency} for the
 * counting phase.
 */
export function computeFrequency(array: readonly number[]): {
  freq: number[]
  maxVal: number
} {
  const maxVal = Math.max(...array)
  const freq = new Array<number>(maxVal + 1).fill(0)
  for (const v of array) freq[v]++
  return { freq, maxVal }
}

/**
 * One frame per element: increment freq[array[i]] and highlight both the source
 * cell and the frequency bucket. A final summary frame locks in the totals.
 */
export const generateFrequency: FrameGenerator<
  FrequencyInput,
  FrequencyState
> = ({ array }) => {
  if (array.length === 0) {
    throw new Error('generateFrequency: vectorul nu poate fi gol')
  }
  if (array.some(v => v < 0 || !Number.isInteger(v))) {
    throw new Error('generateFrequency: valorile trebuie să fie întregi ≥ 0')
  }

  const maxVal = Math.max(...array)
  const freq = new Array<number>(maxVal + 1).fill(0)
  const frames: Frame<FrequencyState>[] = []

  for (let i = 0; i < array.length; i++) {
    const v = array[i]
    freq[v]++
    frames.push({
      state: {
        array,
        freq: [...freq],
        currentIndex: i,
        countedValue: v,
        done: false,
      },
      explanation: `v[${i}] = ${v}, deci mărim freq[${v}] la ${freq[v]}. Numărăm o singură trecere prin vector: O(n).`,
    })
  }

  frames.push({
    state: {
      array,
      freq: [...freq],
      currentIndex: -1,
      countedValue: -1,
      done: true,
    },
    explanation: `Gata! freq[v] ne spune de câte ori apare fiecare valoare. Acum putem răspunde instant la „de câte ori apare v?” fără să mai parcurgem vectorul.`,
  })

  return frames
}
