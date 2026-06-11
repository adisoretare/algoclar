import type { Frame, FrameGenerator } from '../types'

export interface SlidingWindowState {
  array: readonly number[]
  k: number
  start: number // current window start (inclusive)
  end: number // current window end (inclusive)
  windowSum: number
  bestSum: number
  bestStart: number // start of the best window so far
  added: number | null // index that just entered the window
  removed: number | null // index that just left the window
  done: boolean
}

export interface SlidingWindowInput {
  array: number[]
  k: number
}

/**
 * Fixed-size window of length k, maximum sum. The first window is summed once;
 * each slide adds the entering element and subtracts the leaving one (O(1) per
 * step), so the whole scan is O(n) instead of O(n·k).
 */
export const generateSlidingWindow: FrameGenerator<
  SlidingWindowInput,
  SlidingWindowState
> = ({ array, k }) => {
  const n = array.length
  if (n === 0) {
    throw new Error('generateSlidingWindow: vectorul nu poate fi gol')
  }
  if (k < 1 || k > n) {
    throw new Error('generateSlidingWindow: k trebuie să fie între 1 și n')
  }

  const frames: Frame<SlidingWindowState>[] = []

  let windowSum = 0
  for (let i = 0; i < k; i++) windowSum += array[i]
  let bestSum = windowSum
  let bestStart = 0

  frames.push({
    state: {
      array,
      k,
      start: 0,
      end: k - 1,
      windowSum,
      bestSum,
      bestStart,
      added: null,
      removed: null,
      done: n === k,
    },
    explanation: `Prima fereastră [0, ${k - 1}] are suma ${windowSum}. O calculăm o singură dată, direct.`,
  })

  for (let end = k; end < n; end++) {
    const start = end - k + 1
    const removed = start - 1
    windowSum += array[end] - array[removed]
    let note = ''
    if (windowSum > bestSum) {
      bestSum = windowSum
      bestStart = start
      note = ` Nou maxim: ${bestSum}.`
    }
    frames.push({
      state: {
        array,
        k,
        start,
        end,
        windowSum,
        bestSum,
        bestStart,
        added: end,
        removed,
        done: false,
      },
      explanation: `Alunecăm: intră v[${end}] = ${array[end]}, iese v[${removed}] = ${array[removed]}. Suma = ${windowSum}.${note}`,
    })
  }

  frames.push({
    state: {
      array,
      k,
      start: bestStart,
      end: bestStart + k - 1,
      windowSum: bestSum,
      bestSum,
      bestStart,
      added: null,
      removed: null,
      done: true,
    },
    explanation: `Suma maximă a unei ferestre de ${k} elemente este ${bestSum}, la [${bestStart}, ${bestStart + k - 1}]. Totul în O(n).`,
  })

  return frames
}
