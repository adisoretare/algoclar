import type { Frame, FrameGenerator } from '../types'

export interface StreamingStatsState {
  array: readonly number[]
  currentIndex: number // -1 when scan is complete
  sum: number
  maxValue: number
  count: number
  done: boolean
}

export interface StreamingStatsInput {
  array: number[]
}

/**
 * O singura parcurgere care calculeaza suma, maximul si contorul
 * fara sa stocheze vectorul - doar acumulatori.
 */
export const generateStreamingStats: FrameGenerator<
  StreamingStatsInput,
  StreamingStatsState
> = ({ array }) => {
  if (array.length === 0) {
    throw new Error('generateStreamingStats: vectorul nu poate fi gol')
  }

  const frames: Frame<StreamingStatsState>[] = []
  let sum = 0
  let maxValue = array[0]
  let count = 0

  for (let i = 0; i < array.length; i++) {
    count++
    sum += array[i]
    const prevMax = maxValue
    if (array[i] > maxValue) {
      maxValue = array[i]
    }

    let explanation: string

    if (i === 0) {
      explanation = `Citim primul element: ${array[i]}. Inițializăm: contor = ${count}, sumă = ${sum}, max = ${maxValue}. Nu stocăm vectorul — doar actualizăm acumulatorii.`
    } else {
      const maxNote =
        array[i] > prevMax
          ? ` Max nou: ${array[i]} > ${prevMax}.`
          : ` Max neschimbat: ${prevMax}.`
      explanation = `v[${i}] = ${array[i]}: contor → ${count}, sumă → ${sum}.${maxNote} Elementul precedent este deja "uitat" — fără să stocăm vectorul, doar actualizăm sumă/max/contor.`
    }

    frames.push({
      state: { array, currentIndex: i, sum, maxValue, count, done: false },
      explanation,
    })
  }

  const average = (sum / count).toFixed(2)

  frames.push({
    state: { array, currentIndex: -1, sum, maxValue, count, done: true },
    explanation: `Gata! Am parcurs toate cele ${count} elemente fără să le stocăm. Sumă = ${sum}, Max = ${maxValue}, Contor = ${count}, Medie = ${average} — calculat cu doar câțiva acumulatori în memorie.`,
  })

  return frames
}
