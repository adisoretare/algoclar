import type { Frame, FrameGenerator } from '../types'

export type Matrix2 = readonly [readonly [number, number], readonly [number, number]]

export interface MatrixExpoState {
  base: Matrix2 // current squared base
  result: Matrix2 // accumulator
  exponent: number
  remaining: number // p as it is shifted down
  bit: number // current low bit of remaining
  multiplied: boolean // did we fold base into result this step
  step: number
  phase: 'init' | 'step' | 'done'
  done: boolean
}

export interface MatrixExpoInput {
  exponent: number
}

function mul(a: Matrix2, b: Matrix2): Matrix2 {
  return [
    [
      a[0][0] * b[0][0] + a[0][1] * b[1][0],
      a[0][0] * b[0][1] + a[0][1] * b[1][1],
    ],
    [
      a[1][0] * b[0][0] + a[1][1] * b[1][0],
      a[1][0] * b[0][1] + a[1][1] * b[1][1],
    ],
  ]
}

const IDENTITY: Matrix2 = [
  [1, 0],
  [0, 1],
]
const FIB: Matrix2 = [
  [1, 1],
  [1, 0],
]

/**
 * Fast matrix exponentiation (binary exponentiation) of the Fibonacci matrix
 * [[1,1],[1,0]]. Squaring the base and folding it into the result only on set
 * bits computes Mᵖ in O(log p) multiplications. M^p[0][1] = Fib(p).
 */
export const generateMatrixExpo: FrameGenerator<
  MatrixExpoInput,
  MatrixExpoState
> = ({ exponent }) => {
  if (exponent < 1 || exponent > 40 || !Number.isInteger(exponent))
    throw new Error('generateMatrixExpo: exponent între 1 și 40')

  const frames: Frame<MatrixExpoState>[] = []
  let result: Matrix2 = IDENTITY
  let base: Matrix2 = FIB
  let p = exponent
  let step = 0

  frames.push({
    state: {
      base,
      result,
      exponent,
      remaining: p,
      bit: p & 1,
      multiplied: false,
      step,
      phase: 'init',
      done: false,
    },
    explanation: `Vrem M^${exponent} cu M = [[1,1],[1,0]]. Pornim cu rezultat = matricea identitate și ridicăm exponentul în binar: ${exponent} = ${exponent.toString(2)}₂.`,
  })

  while (p > 0) {
    step++
    const bit = p & 1
    let multiplied = false
    if (bit) {
      result = mul(result, base)
      multiplied = true
    }
    frames.push({
      state: {
        base,
        result,
        exponent,
        remaining: p,
        bit,
        multiplied,
        step,
        phase: 'step',
        done: false,
      },
      explanation: multiplied
        ? `Bitul curent e 1 → înmulțim rezultatul cu baza curentă. Apoi ridicăm baza la pătrat.`
        : `Bitul curent e 0 → nu atingem rezultatul. Doar ridicăm baza la pătrat.`,
    })
    base = mul(base, base)
    p >>= 1
  }

  frames.push({
    state: {
      base,
      result,
      exponent,
      remaining: 0,
      bit: 0,
      multiplied: false,
      step,
      phase: 'done',
      done: true,
    },
    explanation: `M^${exponent} calculat în O(log ${exponent}) = ${step} pași. Fib(${exponent}) = ${result[0][1]} (colțul dreapta-sus).`,
  })

  return frames
}
