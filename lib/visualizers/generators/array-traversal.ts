import type { Frame, FrameGenerator } from '../types'

export interface ArrayTraversalState {
  array: readonly number[]
  currentIndex: number  // -1 when traversal is complete
  maxValue: number
  maxIndex: number      // index where the current maximum was found
  sum: number
  done: boolean
}

export interface ArrayTraversalInput {
  array: number[]
}

/**
 * Produces one frame per element visited (n frames) plus a final summary frame.
 * Each frame captures the full state after visiting that element, so the
 * component can render max/sum as they evolve without any extra logic.
 */
export const generateArrayTraversal: FrameGenerator<
  ArrayTraversalInput,
  ArrayTraversalState
> = ({ array }) => {
  if (array.length === 0) {
    throw new Error('generateArrayTraversal: vectorul nu poate fi gol')
  }

  const frames: Frame<ArrayTraversalState>[] = []
  let maxValue = array[0]
  let maxIndex = 0
  let sum = 0

  for (let i = 0; i < array.length; i++) {
    sum += array[i]

    let explanation: string

    if (i === 0) {
      // First element: initialize both max and sum
      explanation = `Inițializăm cu primul element: v[0] = ${array[0]}. max = ${maxValue}, sumă = ${sum}.`
    } else if (array[i] > maxValue) {
      const prevMax = maxValue
      maxValue = array[i]
      maxIndex = i
      explanation = `Comparăm v[${i}] = ${array[i]} cu maximul curent ${prevMax}. ${array[i]} > ${prevMax}, deci maximul devine ${array[i]}. Sumă: ${sum}.`
    } else {
      explanation = `Comparăm v[${i}] = ${array[i]} cu maximul curent ${maxValue}. ${array[i]} ≤ ${maxValue}, maximul rămâne ${maxValue}. Sumă: ${sum}.`
    }

    frames.push({
      state: { array, currentIndex: i, maxValue, maxIndex, sum, done: false },
      explanation,
    })
  }

  // Summary frame: no cell highlighted, final values locked in
  frames.push({
    state: { array, currentIndex: -1, maxValue, maxIndex, sum, done: true },
    explanation: `Traversare completă! Maximul este ${maxValue} (la v[${maxIndex}]), suma totală este ${sum}.`,
  })

  return frames
}
