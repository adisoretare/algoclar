import type { Frame, FrameGenerator } from '../types'

export interface LinkedListState {
  nodes: readonly number[] // values currently in the list, head -> tail
  phase: 'build' | 'traverse' | 'delete' | 'done'
  highlight: number | null // index being processed
  prev: number | null // predecessor highlighted during delete (rewire source)
  marked: number | null // node marked for deletion (still shown)
  done: boolean
}

export interface LinkedListInput {
  values: number[]
}

/**
 * Singly linked list: build by appending (each node points to the next),
 * traverse head-to-tail following the pointers, then delete a middle node by
 * rewiring its predecessor's pointer past it.
 */
export const generateLinkedList: FrameGenerator<
  LinkedListInput,
  LinkedListState
> = ({ values }) => {
  if (values.length < 3) {
    throw new Error('generateLinkedList: nevoie de cel puțin 3 valori')
  }

  const frames: Frame<LinkedListState>[] = []
  const nodes: number[] = []

  // Build
  for (let i = 0; i < values.length; i++) {
    nodes.push(values[i])
    frames.push({
      state: {
        nodes: [...nodes],
        phase: 'build',
        highlight: i,
        prev: i > 0 ? i - 1 : null,
        marked: null,
        done: false,
      },
      explanation:
        i === 0
          ? `Creăm primul nod (head) cu valoarea ${values[i]}.`
          : `Adăugăm un nod nou cu ${values[i]} și legăm nodul anterior de el (next).`,
    })
  }

  // Traverse
  for (let i = 0; i < nodes.length; i++) {
    frames.push({
      state: {
        nodes: [...nodes],
        phase: 'traverse',
        highlight: i,
        prev: null,
        marked: null,
        done: false,
      },
      explanation: `Parcurgem urmând pointerii next: suntem la nodul ${nodes[i]}${i < nodes.length - 1 ? ', mergem mai departe.' : ' (ultimul, next = null).'}`,
    })
  }

  // Delete a middle node
  const target = Math.floor(nodes.length / 2)
  const removedValue = nodes[target]
  frames.push({
    state: {
      nodes: [...nodes],
      phase: 'delete',
      highlight: target,
      prev: target - 1,
      marked: target,
      done: false,
    },
    explanation: `Ștergem nodul ${removedValue}. Mutăm pointerul nodului anterior (${nodes[target - 1]}) să sară peste el, direct la ${nodes[target + 1]}.`,
  })
  nodes.splice(target, 1)
  frames.push({
    state: {
      nodes: [...nodes],
      phase: 'delete',
      highlight: target - 1,
      prev: null,
      marked: null,
      done: false,
    },
    explanation: `Nodul ${removedValue} nu mai e referit de nimeni — a ieșit din listă. Restul rămâne legat.`,
  })

  frames.push({
    state: {
      nodes: [...nodes],
      phase: 'done',
      highlight: null,
      prev: null,
      marked: null,
      done: true,
    },
    explanation: `Lista folosește pointeri, nu poziții fixe: inserarea și ștergerea înseamnă doar relegarea câtorva pointeri, fără să mutăm restul elementelor.`,
  })

  return frames
}
