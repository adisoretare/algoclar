import type { Frame, FrameGenerator } from '../types'

export interface TwoPointersState {
  array: readonly number[] // sorted ascending
  target: number
  l: number
  r: number
  sum: number // array[l] + array[r] at this step
  found: boolean
  notFound: boolean
  done: boolean
}

export interface TwoPointersInput {
  array: number[]
  target: number
}

/**
 * Two pointers on a sorted array: find a pair summing to target.
 * l starts at the left, r at the right; if the sum is too small we move l
 * right (need bigger), if too big we move r left (need smaller).
 */
export const generateTwoPointers: FrameGenerator<
  TwoPointersInput,
  TwoPointersState
> = ({ array, target }) => {
  if (array.length < 2) {
    throw new Error('generateTwoPointers: avem nevoie de cel puțin 2 valori')
  }

  const sorted = [...array].sort((a, b) => a - b)
  const frames: Frame<TwoPointersState>[] = []
  let l = 0
  let r = sorted.length - 1

  frames.push({
    state: {
      array: sorted,
      target,
      l,
      r,
      sum: sorted[l] + sorted[r],
      found: false,
      notFound: false,
      done: false,
    },
    explanation: `Vectorul e sortat crescător. Punem l la stânga (${sorted[l]}) și r la dreapta (${sorted[r]}). Căutăm o pereche cu suma ${target}.`,
  })

  while (l < r) {
    const sum = sorted[l] + sorted[r]
    if (sum === target) {
      frames.push({
        state: {
          array: sorted,
          target,
          l,
          r,
          sum,
          found: true,
          notFound: false,
          done: true,
        },
        explanation: `${sorted[l]} + ${sorted[r]} = ${target}. Găsit! Perechea e (poziția ${l}, poziția ${r}).`,
      })
      return frames
    }
    if (sum < target) {
      const prevL = l
      l++
      frames.push({
        state: {
          array: sorted,
          target,
          l,
          r,
          sum: sorted[l] + sorted[r],
          found: false,
          notFound: false,
          done: false,
        },
        explanation: `${sorted[prevL]} + ${sorted[r]} = ${sum} < ${target}. Suma e prea mică — mutăm l la dreapta ca să creștem.`,
      })
    } else {
      const prevR = r
      r--
      frames.push({
        state: {
          array: sorted,
          target,
          l,
          r,
          sum: sorted[l] + sorted[r],
          found: false,
          notFound: false,
          done: false,
        },
        explanation: `${sorted[l]} + ${sorted[prevR]} = ${sum} > ${target}. Suma e prea mare — mutăm r la stânga ca să scădem.`,
      })
    }
  }

  frames.push({
    state: {
      array: sorted,
      target,
      l,
      r,
      sum: sorted[l] + sorted[r],
      found: false,
      notFound: true,
      done: true,
    },
    explanation: `l și r s-au întâlnit fără să găsim suma ${target}. Nu există o astfel de pereche. Total: O(n), nu O(n²).`,
  })

  return frames
}
