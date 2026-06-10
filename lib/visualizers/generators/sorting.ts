import type { Frame, FrameGenerator } from '../types'

export interface SortingState {
  array: readonly number[]
  comparing: readonly [number, number] | null
  swapping: boolean
  sorted: readonly number[]
  pass: number
  done: boolean
}

export interface SortingInput {
  array: number[]
  algorithm: 'bubble' | 'selection'
}

export const generateSorting: FrameGenerator<SortingInput, SortingState> = ({
  array,
  algorithm,
}) => {
  if (array.length === 0) {
    throw new Error('generateSorting: vectorul nu poate fi gol')
  }
  return algorithm === 'bubble'
    ? generateBubble(array)
    : generateSelection(array)
}

function generateBubble(input: number[]): Frame<SortingState>[] {
  const n = input.length
  const arr = [...input]
  const sorted: number[] = []
  const frames: Frame<SortingState>[] = []

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      const swapping = arr[j] > arr[j + 1]
      frames.push({
        state: {
          array: [...arr],
          comparing: [j, j + 1],
          swapping,
          sorted: [...sorted],
          pass: i + 1,
          done: false,
        },
        explanation: swapping
          ? `Pasul ${i + 1}, poz. ${j}: v[${j}]=${arr[j]} > v[${j + 1}]=${arr[j + 1]}. Swap.`
          : `Pasul ${i + 1}, poz. ${j}: v[${j}]=${arr[j]} ≤ v[${j + 1}]=${arr[j + 1]}. Fără swap.`,
      })
      if (swapping) {
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
      }
    }
    sorted.push(n - 1 - i)
  }

  const allIndices = Array.from({ length: n }, (_, i) => i)
  frames.push({
    state: {
      array: [...arr],
      comparing: null,
      swapping: false,
      sorted: allIndices,
      pass: n - 1,
      done: true,
    },
    explanation: 'Vectorul este sortat!',
  })

  return frames
}

function generateSelection(input: number[]): Frame<SortingState>[] {
  const n = input.length
  const arr = [...input]
  const sorted: number[] = []
  const frames: Frame<SortingState>[] = []

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i

    for (let j = i + 1; j < n; j++) {
      const isNewMin = arr[j] < arr[minIdx]
      frames.push({
        state: {
          array: [...arr],
          comparing: [minIdx, j],
          swapping: false,
          sorted: [...sorted],
          pass: i + 1,
          done: false,
        },
        explanation: isNewMin
          ? `Pasul ${i + 1}: compar v[${minIdx}]=${arr[minIdx]} cu v[${j}]=${arr[j]}. Nou minim: ${arr[j]}.`
          : `Pasul ${i + 1}: compar v[${minIdx}]=${arr[minIdx]} cu v[${j}]=${arr[j]}.`,
      })
      if (isNewMin) minIdx = j
    }

    const swapping = minIdx !== i
    frames.push({
      state: {
        array: [...arr],
        comparing: [i, minIdx],
        swapping,
        sorted: [...sorted],
        pass: i + 1,
        done: false,
      },
      explanation: swapping
        ? `Minimul rundei este ${arr[minIdx]}, mutat la poziția ${i}.`
        : `v[${i}]=${arr[i]} este deja minimul rundei, rămâne pe loc.`,
    })
    if (swapping) {
      ;[arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
    }
    sorted.push(i)
  }

  const allIndices = Array.from({ length: n }, (_, i) => i)
  frames.push({
    state: {
      array: [...arr],
      comparing: null,
      swapping: false,
      sorted: allIndices,
      pass: n - 1,
      done: true,
    },
    explanation: 'Vectorul este sortat!',
  })

  return frames
}
