import type { Frame, FrameGenerator } from '../types'

export interface BaseConvStep {
  v: number // valoarea împărțită la acest pas
  quotient: number // câtul = floor(v / base)
  remainder: number // restul = v % base (cifra produsă, valoare numerică)
  digit: string // restul ca simbol (A.. pentru ≥ 10)
}

export interface BaseConvState {
  value: number // numărul inițial în baza 10
  base: number // baza țintă
  steps: readonly BaseConvStep[] // pașii de împărțire efectuați până acum
  current: number // valoarea curentă care se împarte (-1 la final)
  digits: readonly string[] // cifrele (resturile) colectate, în ordinea producerii
  result: string | null // reprezentarea finală (cifra cea mai semnificativă prima)
  done: boolean
}

export interface BaseConvInput {
  value: number
  base: number
}

const SYMBOLS = '0123456789ABCDEF'

function toSymbol(d: number): string {
  return SYMBOLS[d]
}

/**
 * Convertește un număr din baza 10 într-o bază țintă (2..16) prin împărțiri
 * succesive: cât timp v > 0, restul împărțirii la bază este o cifră, iar câtul
 * devine noul v. Cifrele se obțin de la cea mai puțin semnificativă la cea mai
 * semnificativă, deci la final se citesc în ordine inversă.
 */
export const generateBaseConversion: FrameGenerator<
  BaseConvInput,
  BaseConvState
> = ({ value, base }) => {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(
      'generateBaseConversion: valoarea trebuie să fie un întreg nenegativ',
    )
  }
  if (value > 1e9) {
    throw new Error('generateBaseConversion: valoarea trebuie să fie cel mult 1.000.000.000')
  }
  if (!Number.isInteger(base) || base < 2 || base > 16) {
    throw new Error('generateBaseConversion: baza trebuie să fie între 2 și 16')
  }

  const frames: Frame<BaseConvState>[] = []

  frames.push({
    state: {
      value,
      base,
      steps: [],
      current: value,
      digits: [],
      result: null,
      done: false,
    },
    explanation: `Convertim ${value} din baza 10 în baza ${base} prin împărțiri succesive: împărțim repetat la ${base} și reținem resturile.`,
  })

  // Caz special: valoarea 0 are reprezentarea „0" în orice bază.
  if (value === 0) {
    frames.push({
      state: {
        value,
        base,
        steps: [],
        current: -1,
        digits: ['0'],
        result: '0',
        done: true,
      },
      explanation: `Numărul 0 se scrie tot „0" în baza ${base}. Verificare: 0 = 0.`,
    })
    return frames
  }

  const steps: BaseConvStep[] = []
  const digits: string[] = []
  let v = value

  while (v > 0) {
    const remainder = v % base
    const quotient = Math.floor(v / base)
    const digit = toSymbol(remainder)
    steps.push({ v, quotient, remainder, digit })
    digits.push(digit)
    frames.push({
      state: {
        value,
        base,
        steps: [...steps],
        current: v,
        digits: [...digits],
        result: null,
        done: false,
      },
      explanation: `${v} ÷ ${base} = ${quotient} rest ${remainder} → cifra „${digit}". Continuăm cu câtul ${quotient}. Cifrele colectate se vor citi invers la final.`,
    })
    v = quotient
  }

  const result = [...digits].reverse().join('')

  // Linie de verificare: sum(cifră * base^poziție), poziția 0 = cifra cea mai puțin semnificativă.
  const verifyTerms = digits
    .map((d, i) => `${SYMBOLS.indexOf(d)}·${base}^${i}`)
    .reverse()

  frames.push({
    state: {
      value,
      base,
      steps: [...steps],
      current: -1,
      digits: [...digits],
      result,
      done: true,
    },
    explanation: `Citim resturile de jos în sus: ${value} în baza ${base} este „${result}". Verificare: ${verifyTerms.join(' + ')} = ${value}.`,
  })

  return frames
}
