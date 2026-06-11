import type { Frame, FrameGenerator } from '../types'

export interface MaxMinScanState {
  array: readonly number[]
  currentIndex: number // -1 when scan is complete
  maxValue: number
  maxIndex: number
  minValue: number
  minIndex: number
  done: boolean
}

export interface MaxMinScanInput {
  array: number[]
}

/**
 * O singura parcurgere care urmareste simultan maximul si minimul.
 * Cate un frame per element + un frame final de rezumat.
 */
export const generateMaxMinScan: FrameGenerator<
  MaxMinScanInput,
  MaxMinScanState
> = ({ array }) => {
  if (array.length === 0) {
    throw new Error('generateMaxMinScan: vectorul nu poate fi gol')
  }

  const frames: Frame<MaxMinScanState>[] = []
  let maxValue = array[0]
  let maxIndex = 0
  let minValue = array[0]
  let minIndex = 0

  for (let i = 0; i < array.length; i++) {
    let explanation: string

    if (i === 0) {
      explanation = `Inițializăm ambele cu primul element: v[0] = ${array[0]}. max = ${maxValue}, min = ${minValue}.`
    } else {
      const parts: string[] = []
      if (array[i] > maxValue) {
        const prev = maxValue
        maxValue = array[i]
        maxIndex = i
        parts.push(`${array[i]} > ${prev}, maximul devine ${array[i]}`)
      } else if (array[i] < minValue) {
        const prev = minValue
        minValue = array[i]
        minIndex = i
        parts.push(`${array[i]} < ${prev}, minimul devine ${array[i]}`)
      } else {
        parts.push(`${minValue} ≤ ${array[i]} ≤ ${maxValue}, nimic nu se schimbă`)
      }
      explanation = `v[${i}] = ${array[i]}: ${parts[0]}.`
    }

    frames.push({
      state: { array, currentIndex: i, maxValue, maxIndex, minValue, minIndex, done: false },
      explanation,
    })
  }

  frames.push({
    state: { array, currentIndex: -1, maxValue, maxIndex, minValue, minIndex, done: true },
    explanation: `Gata! Maximul este ${maxValue} (v[${maxIndex}]), minimul este ${minValue} (v[${minIndex}]) — dintr-o singură parcurgere.`,
  })

  return frames
}
