import type { Frame, FrameGenerator } from '../types'

export interface LinearSearchState {
  array: readonly number[]
  i: number // current index being compared; -1 when done not-found
  target: number
  found: boolean | null // null until a result frame
  foundIndex: number // -1 if none
  done: boolean
  comparisons: number // number of comparisons made so far
}

export interface LinearSearchInput {
  array: number[]
  target: number
}

/**
 * Generates frames that demonstrate linear search of a value in a vector.
 * Scans i from 0, one frame per comparison (array[i] vs target). Stops with a
 * 'found' frame on equality, or a 'not-found' frame after reaching the end.
 */
export const generateLinearSearch: FrameGenerator<
  LinearSearchInput,
  LinearSearchState
> = ({ array, target }) => {
  if (array.length === 0) {
    throw new Error('generateLinearSearch: vectorul nu poate fi gol')
  }
  if (array.length > 20) {
    throw new Error('generateLinearSearch: maximum 20 de valori')
  }

  const frames: Frame<LinearSearchState>[] = []
  let comparisons = 0

  for (let i = 0; i < array.length; i++) {
    comparisons++
    const value = array[i]

    if (value === target) {
      frames.push({
        state: {
          array,
          i,
          target,
          found: true,
          foundIndex: i,
          done: true,
          comparisons,
        },
        explanation: `v[${i}]=${value} = ${target}, găsit la indexul ${i}`,
      })
      return frames
    }

    frames.push({
      state: {
        array,
        i,
        target,
        found: null,
        foundIndex: -1,
        done: false,
        comparisons,
      },
      explanation: `v[${i}]=${value} ≠ ${target}, continuăm`,
    })
  }

  // not-found frame
  frames.push({
    state: {
      array,
      i: -1,
      target,
      found: false,
      foundIndex: -1,
      done: true,
      comparisons,
    },
    explanation: `Am parcurs tot vectorul: ${target} nu există în vector`,
  })

  return frames
}
