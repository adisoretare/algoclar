import type { Frame, FrameGenerator } from '../types'

export interface GcdStep {
  a: number
  b: number
  r: number
}

export interface GcdState {
  /** Current pair before this iteration's assignment (a, b). */
  a: number
  b: number
  /** Remainder computed this iteration: r = a % b. -1 on the final frame. */
  r: number
  /** Accumulated history of (a, b, r) rows for the table view. */
  history: readonly GcdStep[]
  /** Final result, set only on the last frame; -1 otherwise. */
  gcd: number
  done: boolean
}

export interface GcdInput {
  a: number
  b: number
}

const MAX = 1_000_000

/**
 * Generează cadre pentru algoritmul lui Euclid (forma cu modulo) care
 * calculează CMMDC(a, b): while (b > 0) { r = a % b; a = b; b = r }.
 * Câte un cadru pe iterație, plus un cadru final cu rezultatul.
 */
export const generateGcdEuclid: FrameGenerator<GcdInput, GcdState> = ({
  a,
  b,
}) => {
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new Error('CMMDC: a și b trebuie să fie numere întregi.')
  }
  if (a <= 0 || b <= 0) {
    throw new Error('CMMDC: a și b trebuie să fie numere strict pozitive.')
  }
  if (a > MAX || b > MAX) {
    throw new Error('CMMDC: a și b trebuie să fie cel mult 1.000.000.')
  }

  const frames: Frame<GcdState>[] = []
  const history: GcdStep[] = []

  let curA = a
  let curB = b

  while (curB > 0) {
    const r = curA % curB
    const quotient = Math.floor(curA / curB)
    history.push({ a: curA, b: curB, r })

    const explanation =
      r === 0
        ? `CMMDC(${curA}, ${curB}): ${curA} = ${quotient}·${curB} + 0, deci restul este 0 — ne oprim, CMMDC este ${curB}.`
        : `CMMDC(${curA}, ${curB}): ${curA} = ${quotient}·${curB} + ${r}, deci continuăm cu (${curB}, ${r})…`

    frames.push({
      state: {
        a: curA,
        b: curB,
        r,
        history: history.slice(),
        gcd: -1,
        done: false,
      },
      explanation,
    })

    curA = curB
    curB = r
  }

  // Final frame: b a ajuns 0, deci curA este CMMDC.
  frames.push({
    state: {
      a: curA,
      b: 0,
      r: -1,
      history: history.slice(),
      gcd: curA,
      done: true,
    },
    explanation: `b a ajuns 0, deci CMMDC(${a}, ${b}) = ${curA}.`,
  })

  return frames
}
