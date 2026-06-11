import type { Frame, FrameGenerator } from '../types'

export interface DouaMaximeState {
  array: readonly number[]
  currentIndex: number // -1 when scan is complete
  max1: number
  max1Index: number
  max2: number
  max2Index: number // -1 when no distinct second maximum found yet
  done: boolean
}

export interface DouaMaximeInput {
  array: number[]
}

/**
 * O singura parcurgere care urmareste maximul si al doilea maxim distinct.
 * Cate un frame per element + un frame final de rezumat.
 */
export const generateDouaMaxime: FrameGenerator<
  DouaMaximeInput,
  DouaMaximeState
> = ({ array }) => {
  if (array.length === 0) {
    throw new Error('generateDouaMaxime: vectorul nu poate fi gol')
  }

  const frames: Frame<DouaMaximeState>[] = []

  let max1 = array[0]
  let max1Index = 0
  let max2 = -Infinity
  let max2Index = -1

  // Frame for index 0: initialization
  frames.push({
    state: { array, currentIndex: 0, max1, max1Index, max2, max2Index, done: false },
    explanation: `Inițializăm: v[0] = ${array[0]} devine primul maxim. Al doilea maxim nu există încă.`,
  })

  for (let i = 1; i < array.length; i++) {
    let explanation: string

    if (array[i] > max1) {
      // Current element beats max1: demote max1 to max2, promote current to max1
      const prevMax1 = max1
      const prevMax1Index = max1Index
      max2 = prevMax1
      max2Index = prevMax1Index
      max1 = array[i]
      max1Index = i
      explanation = `v[${i}] = ${array[i]} > max1 (${prevMax1}): max1 devine ${array[i]}, iar ${prevMax1} coboară ca max2.`
    } else if (array[i] < max1 && array[i] > max2) {
      // Current element is between max1 and max2: update max2
      const prevMax2 = max2 === -Infinity ? null : max2
      max2 = array[i]
      max2Index = i
      if (prevMax2 === null) {
        explanation = `v[${i}] = ${array[i]} < max1 (${max1}) și nu există max2: ${array[i]} devine al doilea maxim.`
      } else {
        explanation = `v[${i}] = ${array[i]} < max1 (${max1}) și ${array[i]} > max2 (${prevMax2}): max2 devine ${array[i]}.`
      }
    } else {
      // No change
      if (array[i] === max1) {
        explanation = `v[${i}] = ${array[i]} este egal cu max1 (${max1}): nu este un al doilea maxim distinct, nimic nu se schimbă.`
      } else {
        explanation = `v[${i}] = ${array[i]} ≤ max2 (${max2 === -Infinity ? '−∞' : max2}): nimic nu se schimbă.`
      }
    }

    frames.push({
      state: { array, currentIndex: i, max1, max1Index, max2, max2Index, done: false },
      explanation,
    })
  }

  // Final summary frame
  const finalExplanation =
    max2Index === -1
      ? `Gata! Primul maxim este ${max1} (v[${max1Index}]). Nu există un al doilea maxim distinct (toate elementele sunt egale).`
      : `Gata! Primul maxim este ${max1} (v[${max1Index}]), al doilea maxim distinct este ${max2} (v[${max2Index}]) — dintr-o singură parcurgere.`

  frames.push({
    state: { array, currentIndex: -1, max1, max1Index, max2, max2Index, done: true },
    explanation: finalExplanation,
  })

  return frames
}
