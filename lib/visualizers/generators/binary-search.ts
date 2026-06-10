import type { Frame, FrameGenerator } from '../types'

export interface BinarySearchState {
  array: readonly number[]
  target: number
  st: number
  dr: number
  mid: number
  eliminated: readonly boolean[]
  found: boolean
  notFound: boolean
  foundIndex: number | null
}

export interface BinarySearchInput {
  array: number[]
  target: number
}

export const generateBinarySearch: FrameGenerator<
  BinarySearchInput,
  BinarySearchState
> = ({ array, target }) => {
  if (array.length === 0) {
    throw new Error('generateBinarySearch: vectorul nu poate fi gol')
  }

  const n = array.length
  const frames: Frame<BinarySearchState>[] = []
  const elim = new Array<boolean>(n).fill(false)

  let st = 0
  let dr = n - 1
  let mid = Math.floor((st + dr) / 2)

  frames.push({
    state: {
      array,
      target,
      st,
      dr,
      mid,
      eliminated: [...elim],
      found: false,
      notFound: false,
      foundIndex: null,
    },
    explanation: `Inițializăm: st=${st}, dr=${dr}, mid=${mid}. Căutăm ${target}.`,
  })

  while (st <= dr) {
    mid = Math.floor((st + dr) / 2)

    if (array[mid] === target) {
      frames.push({
        state: {
          array,
          target,
          st,
          dr,
          mid,
          eliminated: [...elim],
          found: true,
          notFound: false,
          foundIndex: mid,
        },
        explanation: `mid=${mid}, v[${mid}]=${array[mid]} = ${target}. Găsit la indexul ${mid}!`,
      })
      return frames
    }

    if (array[mid] < target) {
      for (let i = st; i <= mid; i++) elim[i] = true
      st = mid + 1
      frames.push({
        state: {
          array,
          target,
          st,
          dr,
          mid,
          eliminated: [...elim],
          found: false,
          notFound: false,
          foundIndex: null,
        },
        explanation: `mid=${mid}, v[${mid}]=${array[mid]} < ${target}, deci căutăm în dreapta: st devine ${st}.`,
      })
    } else {
      for (let i = mid; i <= dr; i++) elim[i] = true
      dr = mid - 1
      frames.push({
        state: {
          array,
          target,
          st,
          dr,
          mid,
          eliminated: [...elim],
          found: false,
          notFound: false,
          foundIndex: null,
        },
        explanation: `mid=${mid}, v[${mid}]=${array[mid]} > ${target}, deci căutăm în stânga: dr devine ${dr}.`,
      })
    }
  }

  frames.push({
    state: {
      array,
      target,
      st,
      dr,
      mid,
      eliminated: [...elim],
      found: false,
      notFound: true,
      foundIndex: null,
    },
    explanation: `st=${st} > dr=${dr}. Elementul ${target} nu există în vector.`,
  })

  return frames
}
