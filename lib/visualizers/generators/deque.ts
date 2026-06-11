import type { Frame, FrameGenerator } from '../types'

export interface DequeState {
  items: readonly number[] // front -> back
  op: 'pushFront' | 'pushBack' | 'popFront' | 'popBack' | null
  highlight: number | null
  side: 'front' | 'back' | null
  done: boolean
}

export interface DequeInput {
  values: number[]
}

/**
 * Double-ended queue: we add at both ends (even-index values to the back,
 * odd-index to the front), then remove alternately from front and back to show
 * that a deque supports all four operations in O(1).
 */
export const generateDeque: FrameGenerator<DequeInput, DequeState> = ({
  values,
}) => {
  if (values.length === 0) {
    throw new Error('generateDeque: nevoie de cel puțin o valoare')
  }

  const frames: Frame<DequeState>[] = []
  const items: number[] = []

  frames.push({
    state: { items: [], op: null, highlight: null, side: null, done: false },
    explanation: `Deque gol. Spre deosebire de stivă/coadă, putem adăuga și scoate de la AMBELE capete.`,
  })

  values.forEach((v, i) => {
    if (i % 2 === 0) {
      items.push(v)
      frames.push({
        state: {
          items: [...items],
          op: 'pushBack',
          highlight: v,
          side: 'back',
          done: false,
        },
        explanation: `pushBack(${v}): adăugăm ${v} la spate.`,
      })
    } else {
      items.unshift(v)
      frames.push({
        state: {
          items: [...items],
          op: 'pushFront',
          highlight: v,
          side: 'front',
          done: false,
        },
        explanation: `pushFront(${v}): adăugăm ${v} în față.`,
      })
    }
  })

  let fromFront = true
  while (items.length > 0) {
    if (fromFront) {
      const v = items.shift() as number
      frames.push({
        state: {
          items: [...items],
          op: 'popFront',
          highlight: v,
          side: 'front',
          done: false,
        },
        explanation: `popFront(): scoatem ${v} din față. Rămân ${items.length}.`,
      })
    } else {
      const v = items.pop() as number
      frames.push({
        state: {
          items: [...items],
          op: 'popBack',
          highlight: v,
          side: 'back',
          done: false,
        },
        explanation: `popBack(): scoatem ${v} din spate. Rămân ${items.length}.`,
      })
    }
    fromFront = !fromFront
  }

  frames.push({
    state: { items: [], op: null, highlight: null, side: null, done: true },
    explanation: `Deque gol. Am folosit toate cele 4 operații — pushFront, pushBack, popFront, popBack — fiecare în O(1).`,
  })

  return frames
}
