import type { Frame, FrameGenerator } from '../types'

export interface QueueState {
  items: readonly number[] // front -> back
  op: 'enqueue' | 'dequeue' | null
  highlight: number | null
  done: boolean
}

export interface QueueInput {
  values: number[]
}

/**
 * Demonstrates FIFO: enqueue every value at the back, then dequeue from the
 * front. The dequeue order equals the enqueue order — opposite of a stack.
 */
export const generateQueue: FrameGenerator<QueueInput, QueueState> = ({
  values,
}) => {
  if (values.length === 0) {
    throw new Error('generateQueue: nevoie de cel puțin o valoare')
  }

  const frames: Frame<QueueState>[] = []
  const items: number[] = []

  frames.push({
    state: { items: [], op: null, highlight: null, done: false },
    explanation: `Coadă goală. Adăugăm la spate, scoatem din față (FIFO — primul intrat, primul ieșit).`,
  })

  for (const v of values) {
    items.push(v)
    frames.push({
      state: { items: [...items], op: 'enqueue', highlight: v, done: false },
      explanation: `enqueue(${v}): adăugăm ${v} la spatele cozii. Lungime: ${items.length}.`,
    })
  }

  while (items.length > 0) {
    const v = items.shift() as number
    frames.push({
      state: { items: [...items], op: 'dequeue', highlight: v, done: false },
      explanation: `dequeue(): scoatem ${v} din față — primul care a intrat. Rămân ${items.length}.`,
    })
  }

  frames.push({
    state: { items: [], op: null, highlight: null, done: true },
    explanation: `Coada e goală. Ordinea ieșirii a fost aceeași cu a intrării — asta înseamnă FIFO.`,
  })

  return frames
}
