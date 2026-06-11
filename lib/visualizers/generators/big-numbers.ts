import type { Frame, FrameGenerator } from '../types'

export interface BigNumbersState {
  a: readonly number[] // digits, most-significant first
  b: readonly number[]
  result: readonly number[] // digits MSB first, grows from the right
  pos: number // 0-based column from the right being added; -1 at done
  carry: number
  digitSum: number | null // a_k + b_k + carry_in at this column
  done: boolean
}

export interface BigNumbersInput {
  a: number[] // digits MSB first
  b: number[]
}

/**
 * Adds two big numbers digit by digit, right to left, carrying when a column
 * sum reaches 10 — exactly how you'd add on paper, which is why it works for
 * numbers far larger than a machine integer.
 */
export const generateBigNumbers: FrameGenerator<
  BigNumbersInput,
  BigNumbersState
> = ({ a, b }) => {
  if (a.length === 0 || b.length === 0) {
    throw new Error('generateBigNumbers: ambele numere trebuie să aibă cifre')
  }
  if ([...a, ...b].some(d => d < 0 || d > 9 || !Number.isInteger(d))) {
    throw new Error('generateBigNumbers: cifrele trebuie să fie între 0 și 9')
  }

  const len = Math.max(a.length, b.length)
  const result: number[] = []
  const frames: Frame<BigNumbersState>[] = []
  let carry = 0

  frames.push({
    state: { a, b, result: [], pos: -1, carry: 0, digitSum: null, done: false },
    explanation: `Aliniem numerele la dreapta și adunăm coloană cu coloană, de la cifra cea mai puțin semnificativă.`,
  })

  for (let k = 0; k < len; k++) {
    const da = a[a.length - 1 - k] ?? 0
    const db = b[b.length - 1 - k] ?? 0
    const s = da + db + carry
    const digit = s % 10
    const newCarry = Math.floor(s / 10)
    result.unshift(digit)
    frames.push({
      state: {
        a,
        b,
        result: [...result],
        pos: k,
        carry: newCarry,
        digitSum: s,
        done: false,
      },
      explanation: `Coloana ${k + 1} (de la dreapta): ${da} + ${db} + transport ${carry} = ${s}. Scriem cifra ${digit}${newCarry > 0 ? ` și reportăm ${newCarry}` : ' (fără report)'}.`,
    })
    carry = newCarry
  }

  if (carry > 0) {
    result.unshift(carry)
    frames.push({
      state: {
        a,
        b,
        result: [...result],
        pos: len,
        carry: 0,
        digitSum: carry,
        done: false,
      },
      explanation: `Mai rămâne un transport de ${carry} — îl scriem ca cifră nouă în față.`,
    })
  }

  frames.push({
    state: { a, b, result: [...result], pos: -1, carry: 0, digitSum: null, done: true },
    explanation: `Rezultat: ${result.join('')}. Metoda merge pentru numere de orice lungime, stocate ca șiruri de cifre.`,
  })

  return frames
}
