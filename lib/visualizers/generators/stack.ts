import type { Frame, FrameGenerator } from '../types'

export interface StackState {
  items: readonly number[] // bottom -> top
  op: 'push' | 'pop' | null
  highlight: number | null // value involved in the current op
  done: boolean
}

export interface StackInput {
  values: number[]
}

/**
 * Demonstrates LIFO: push every value, then pop them all. The pop order is the
 * reverse of the push order — the whole point of a stack.
 */
export const generateStack: FrameGenerator<StackInput, StackState> = ({
  values,
}) => {
  if (values.length === 0) {
    throw new Error('generateStack: nevoie de cel puțin o valoare')
  }

  const frames: Frame<StackState>[] = []
  const items: number[] = []

  frames.push({
    state: { items: [], op: null, highlight: null, done: false },
    explanation: `Stivă goală. Adăugăm și scoatem doar de la vârf (LIFO — ultimul intrat, primul ieșit).`,
  })

  for (const v of values) {
    items.push(v)
    frames.push({
      state: { items: [...items], op: 'push', highlight: v, done: false },
      explanation: `push(${v}): punem ${v} pe vârful stivei. Înălțime: ${items.length}.`,
    })
  }

  while (items.length > 0) {
    const v = items.pop() as number
    frames.push({
      state: { items: [...items], op: 'pop', highlight: v, done: false },
      explanation: `pop(): scoatem ${v} de pe vârf — exact ultimul adăugat. Rămân ${items.length}.`,
    })
  }

  frames.push({
    state: { items: [], op: null, highlight: null, done: true },
    explanation: `Stiva e goală. Ordinea ieșirii a fost inversul intrării — asta înseamnă LIFO.`,
  })

  return frames
}
