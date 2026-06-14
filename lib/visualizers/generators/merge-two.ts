import type { Frame, FrameGenerator } from '../types'

export interface MergeState {
  a: readonly number[] // sorted ascending
  b: readonly number[] // sorted ascending
  i: number // pointer in a
  j: number // pointer in b
  result: readonly number[] // merged so far
  taken: 'a' | 'b' | null // which side was taken this step
  done: boolean
}

export interface MergeInput {
  a: number[]
  b: number[]
}

function isSortedAscending(arr: readonly number[]): boolean {
  for (let k = 1; k < arr.length; k++) {
    if (arr[k] < arr[k - 1]) return false
  }
  return true
}

/**
 * Interclasarea (merge) a doi vectori sortați crescător.
 * Doi pointeri i (în A) și j (în B): la fiecare pas comparăm a[i] cu b[j],
 * luăm valoarea mai mică în rezultat și avansăm pointerul respectiv. Când unul
 * dintre vectori s-a terminat, golim (drain) restul celuilalt.
 */
export const generateMergeTwo: FrameGenerator<MergeInput, MergeState> = ({
  a,
  b,
}) => {
  if (a.length === 0 || b.length === 0) {
    throw new Error(
      'generateMergeTwo: ambii vectori trebuie să aibă cel puțin un element',
    )
  }
  if (a.length + b.length > 24) {
    throw new Error(
      'generateMergeTwo: cei doi vectori au împreună prea multe valori (maximum 24)',
    )
  }
  if (!isSortedAscending(a)) {
    throw new Error('generateMergeTwo: vectorul A nu este sortat crescător')
  }
  if (!isSortedAscending(b)) {
    throw new Error('generateMergeTwo: vectorul B nu este sortat crescător')
  }

  const frames: Frame<MergeState>[] = []
  let i = 0
  let j = 0
  const result: number[] = []

  // Frame 0 — starting state, nothing taken yet.
  frames.push({
    state: {
      a,
      b,
      i,
      j,
      result: [...result],
      taken: null,
      done: false,
    },
    explanation: `Ambii vectori sunt sortați crescător. Punem i la începutul lui A (a[0]=${a[0]}) și j la începutul lui B (b[0]=${b[0]}). La fiecare pas luăm valoarea mai mică.`,
  })

  // Merge phase — compare while both pointers are in range.
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) {
      const value = a[i]
      const prevI = i
      result.push(value)
      i++
      frames.push({
        state: {
          a,
          b,
          i,
          j,
          result: [...result],
          taken: 'a',
          done: false,
        },
        explanation: `a[${prevI}]=${value} ≤ b[${j}]=${b[j]} → luăm din A. Adăugăm ${value} în rezultat și avansăm i.`,
      })
    } else {
      const value = b[j]
      const prevJ = j
      result.push(value)
      j++
      frames.push({
        state: {
          a,
          b,
          i,
          j,
          result: [...result],
          taken: 'b',
          done: false,
        },
        explanation: `b[${prevJ}]=${value} < a[${i}]=${a[i]} → luăm din B. Adăugăm ${value} în rezultat și avansăm j.`,
      })
    }
  }

  // Drain phase A — B is exhausted, copy the rest of A.
  while (i < a.length) {
    const value = a[i]
    const prevI = i
    result.push(value)
    i++
    frames.push({
      state: {
        a,
        b,
        i,
        j,
        result: [...result],
        taken: 'a',
        done: false,
      },
      explanation: `B s-a terminat. Copiem restul lui A: luăm a[${prevI}]=${value} în rezultat.`,
    })
  }

  // Drain phase B — A is exhausted, copy the rest of B.
  while (j < b.length) {
    const value = b[j]
    const prevJ = j
    result.push(value)
    j++
    frames.push({
      state: {
        a,
        b,
        i,
        j,
        result: [...result],
        taken: 'b',
        done: false,
      },
      explanation: `A s-a terminat. Copiem restul lui B: luăm b[${prevJ}]=${value} în rezultat.`,
    })
  }

  // Final frame — done.
  frames.push({
    state: {
      a,
      b,
      i,
      j,
      result: [...result],
      taken: null,
      done: true,
    },
    explanation: `Gata! Am interclasat cei doi vectori într-unul singur sortat, de ${result.length} elemente. Total: O(n+m).`,
  })

  return frames
}
