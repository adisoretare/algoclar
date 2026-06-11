import type { Frame, FrameGenerator } from '../types'

export interface KadaneState {
  array: readonly number[]
  index: number // current element being processed; -1 at the summary frame
  current: number // best sum of a subarray ENDING at index
  best: number // best sum seen so far
  curStart: number // start of the current running subarray
  bestStart: number // start of the best subarray so far
  bestEnd: number // end of the best subarray so far
  restarted: boolean // true if we dropped the prefix and restarted at index
  done: boolean
}

export interface KadaneInput {
  array: number[]
}

/**
 * Kadane's algorithm — maximum subarray sum in O(n).
 *
 * At each element we choose between extending the current subarray
 * (current + a[i]) or starting fresh at a[i]. We restart exactly when the
 * running sum has gone negative (current < 0), because a negative prefix can
 * only hurt. `best` tracks the best window ever seen, so the algorithm is
 * correct even when every value is negative (it picks the largest element).
 */
export const generateKadane: FrameGenerator<KadaneInput, KadaneState> = ({
  array,
}) => {
  if (array.length === 0) {
    throw new Error('generateKadane: vectorul nu poate fi gol')
  }

  const frames: Frame<KadaneState>[] = []

  let current = array[0]
  let best = array[0]
  let curStart = 0
  let bestStart = 0
  let bestEnd = 0

  frames.push({
    state: {
      array,
      index: 0,
      current,
      best,
      curStart,
      bestStart,
      bestEnd,
      restarted: false,
      done: false,
    },
    explanation: `Pornim de la primul element: sumă curentă = ${current}, maximul = ${best}. „Sumă curentă” = cea mai bună secvență care se termină exact aici.`,
  })

  for (let i = 1; i < array.length; i++) {
    let restarted: boolean
    if (current + array[i] >= array[i]) {
      // extending keeps us at least as high as starting over (current >= 0)
      current = current + array[i]
      restarted = false
    } else {
      current = array[i]
      curStart = i
      restarted = true
    }

    let note: string
    if (current > best) {
      best = current
      bestStart = curStart
      bestEnd = i
      note = ` Nou maxim: ${best} pe [${bestStart}, ${bestEnd}].`
    } else {
      note = ` Maximul rămâne ${best}.`
    }

    const explanation = restarted
      ? `v[${i}] = ${array[i]}. Suma de până acum devenise negativă, deci o aruncăm și pornim o secvență nouă de la v[${i}]. Sumă curentă = ${current}.${note}`
      : `v[${i}] = ${array[i]}. Extindem secvența curentă: sumă curentă = ${current}.${note}`

    frames.push({
      state: {
        array,
        index: i,
        current,
        best,
        curStart,
        bestStart,
        bestEnd,
        restarted,
        done: false,
      },
      explanation,
    })
  }

  frames.push({
    state: {
      array,
      index: -1,
      current,
      best,
      curStart,
      bestStart,
      bestEnd,
      restarted: false,
      done: true,
    },
    explanation: `Suma maximă a unei secvențe este ${best}, pe intervalul [${bestStart}, ${bestEnd}]. O singură trecere prin vector: O(n), fără să încercăm toate secvențele O(n²).`,
  })

  return frames
}
