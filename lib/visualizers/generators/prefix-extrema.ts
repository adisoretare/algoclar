import type { Frame, FrameGenerator } from '../types'

export type PrefixExtremaDirection = 'prefix' | 'sufix'
export type PrefixExtremaKind = 'max' | 'min'

export interface PrefixExtremaState {
  array: readonly number[]
  result: readonly number[] // extrema array, same length as array
  filled: readonly boolean[] // which result cells are filled
  currentIndex: number // index just filled, or -1 before start
  sourceIndex: number // previously-filled extrema cell used, or -1
  direction: PrefixExtremaDirection
  kind: PrefixExtremaKind
  done: boolean
}

export interface PrefixExtremaInput {
  array: number[]
  direction: PrefixExtremaDirection
  kind: PrefixExtremaKind
}

/**
 * Builds prefix/suffix extrema (max or min) one cell per frame.
 *  prefix: P[0] = a[0]; P[i] = op(P[i-1], a[i])  (stânga → dreapta)
 *  sufix:  S[n-1] = a[n-1]; S[i] = op(S[i+1], a[i]) (dreapta → stânga)
 *  op = Math.max sau Math.min, după kind.
 */
export const generatePrefixExtrema: FrameGenerator<
  PrefixExtremaInput,
  PrefixExtremaState
> = ({ array, direction, kind }) => {
  if (array.length === 0) {
    throw new Error('generatePrefixExtrema: vectorul nu poate fi gol')
  }
  if (array.length > 15) {
    throw new Error('generatePrefixExtrema: maximum 15 valori')
  }

  const n = array.length
  const op = kind === 'max' ? Math.max : Math.min
  const opName = kind === 'max' ? 'max' : 'min'
  const letter = direction === 'prefix' ? 'P' : 'S'

  const result = new Array<number>(n).fill(0)
  const filled = new Array<boolean>(n).fill(false)
  const frames: Frame<PrefixExtremaState>[] = []

  const snapshot = (
    currentIndex: number,
    sourceIndex: number,
    done: boolean,
  ): PrefixExtremaState => ({
    array,
    result: [...result],
    filled: [...filled],
    currentIndex,
    sourceIndex,
    direction,
    kind,
    done,
  })

  if (direction === 'prefix') {
    result[0] = array[0]
    filled[0] = true
    frames.push({
      state: snapshot(0, -1, n === 1),
      explanation: `${letter}[0] = a[0] = ${array[0]} (primul element devine extrema inițială).`,
    })

    for (let i = 1; i < n; i++) {
      const prev = result[i - 1]
      result[i] = op(prev, array[i])
      filled[i] = true
      frames.push({
        state: snapshot(i, i - 1, i === n - 1),
        explanation: `${letter}[${i}] = ${opName}(${letter}[${i - 1}]=${prev}, a[${i}]=${array[i]}) = ${result[i]}.`,
      })
    }
  } else {
    result[n - 1] = array[n - 1]
    filled[n - 1] = true
    frames.push({
      state: snapshot(n - 1, -1, n === 1),
      explanation: `${letter}[${n - 1}] = a[${n - 1}] = ${array[n - 1]} (ultimul element devine extrema inițială).`,
    })

    for (let i = n - 2; i >= 0; i--) {
      const prev = result[i + 1]
      result[i] = op(prev, array[i])
      filled[i] = true
      frames.push({
        state: snapshot(i, i + 1, i === 0),
        explanation: `${letter}[${i}] = ${opName}(${letter}[${i + 1}]=${prev}, a[${i}]=${array[i]}) = ${result[i]}.`,
      })
    }
  }

  return frames
}
