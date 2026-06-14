import type { Frame, FrameGenerator } from '../types'

export interface FastPowerState {
  base: number // baza inițială
  exp: number // exponentul inițial
  mod: number // modulul (0 = fără modulo)
  bits: readonly number[] // biții exponentului, de la cel mai semnificativ la cel mai puțin
  activeBit: number // indexul (în `bits`) bitului procesat în pasul curent; -1 dacă niciunul
  e: number // exponentul rămas (e >> 1 după fiecare pas)
  b: number // baza curentă (se ridică la pătrat)
  result: number // rezultatul acumulat
  multiplied: boolean // dacă în pasul curent am înmulțit rezultatul cu baza
  done: boolean
}

export interface FastPowerInput {
  base: number
  exp: number
  mod?: number // 0 sau lipsă = fără modulo
}

const MAX_EXP = 30
const MAX_BASE = 1000
const MAX_MOD = 1_000_000_000
const MAX_RESULT = 1e15

/** Înmulțire urmată de modulo. Fără modulo: produs simplu (mărginit de validare).
 *  Cu modulo: folosim BigInt ca să evităm pierderea de precizie când produsul
 *  depășește Number.MAX_SAFE_INTEGER (mod poate fi până la 1e9, deci x*x ~1e18). */
function mulMod(x: number, y: number, mod: number): number {
  if (mod <= 0) return x * y
  return Number((BigInt(x) * BigInt(y)) % BigInt(mod))
}

/**
 * Exponentiere rapidă prin pătrate (ridicare la putere în timp logaritmic).
 *
 * result = 1; b = base; e = exp
 * cât timp e > 0:
 *   dacă bitul curent al lui e este 1 → result *= b
 *   b *= b
 *   e >>= 1
 * Cu modulo opțional aplicat asupra lui result și b după fiecare înmulțire.
 */
export const generateFastPower: FrameGenerator<
  FastPowerInput,
  FastPowerState
> = ({ base, exp, mod = 0 }) => {
  if (!Number.isInteger(base) || !Number.isInteger(exp) || !Number.isInteger(mod)) {
    throw new Error('generateFastPower: baza, exponentul și modulul trebuie să fie numere întregi')
  }
  if (exp < 0) {
    throw new Error('generateFastPower: exponentul nu poate fi negativ')
  }
  if (exp > MAX_EXP) {
    throw new Error(`generateFastPower: exponentul trebuie să fie cel mult ${MAX_EXP}`)
  }
  if (base < 0 || base > MAX_BASE) {
    throw new Error(`generateFastPower: baza trebuie să fie între 0 și ${MAX_BASE}`)
  }
  if (mod < 0 || mod > MAX_MOD) {
    throw new Error(`generateFastPower: modulul trebuie să fie între 0 și ${MAX_MOD}`)
  }

  // Fără modulo, rezultatul poate exploda — limităm ca să rămânem sub limita sigură.
  if (mod === 0) {
    const projected = Math.pow(base, exp)
    if (projected >= MAX_RESULT) {
      throw new Error(
        `generateFastPower: fără modulo rezultatul depășește limita sigură (${MAX_RESULT.toExponential()}). Folosește un exponent/bază mai mici sau un modul.`,
      )
    }
  }

  // Biții exponentului, MSB → LSB (cel puțin un bit, chiar și pentru exp = 0).
  const bits: number[] = exp === 0 ? [0] : exp.toString(2).split('').map(Number)
  const lsbIndex = bits.length - 1 // indexul bitului cel mai puțin semnificativ în `bits`

  const frames: Frame<FastPowerState>[] = []

  let b = mod > 0 ? base % mod : base
  let e = exp
  let result = mod > 0 ? 1 % mod : 1

  const snapshot = (
    overrides: Partial<FastPowerState>,
  ): FastPowerState => ({
    base,
    exp,
    mod,
    bits: [...bits],
    activeBit: -1,
    e,
    b,
    result,
    multiplied: false,
    done: false,
    ...overrides,
  })

  // Frame inițial: arătăm exponentul în binar.
  frames.push({
    state: snapshot({}),
    explanation: `Scriem exponentul ${exp} în baza 2: ${bits.join('')}. Parcurgem biții de la cel mai puțin semnificativ (dreapta) la cel mai semnificativ (stânga). result = ${result}, b = ${b}.${mod > 0 ? ` Lucrăm modulo ${mod}.` : ''}`,
  })

  // Procesăm bit cu bit, de la LSB spre MSB. `step` = poziția bitului (0 = LSB).
  let step = 0
  while (e > 0) {
    const bit = e & 1
    const activeBit = lsbIndex - step // indexul în `bits` (MSB-first)
    const bBefore = b
    let multiplied = false

    if (bit === 1) {
      result = mulMod(result, b, mod)
      multiplied = true
    }
    b = mulMod(b, b, mod)
    e = e >> 1

    frames.push({
      state: snapshot({ activeBit, multiplied, b, e, result }),
      explanation:
        bit === 1
          ? `Bitul ${step} (de la dreapta) este 1 → înmulțim rezultatul cu baza curentă: result = ${result}${mod > 0 ? ` (mod ${mod})` : ''}. Apoi ridicăm baza la pătrat: b = ${bBefore}² = ${b}${mod > 0 ? ` (mod ${mod})` : ''} și deplasăm exponentul (e = ${e}).`
          : `Bitul ${step} (de la dreapta) este 0 → sărim înmulțirea (result rămâne ${result}). Ridicăm doar baza la pătrat: b = ${bBefore}² = ${b}${mod > 0 ? ` (mod ${mod})` : ''} și deplasăm exponentul (e = ${e}).`,
    })

    step++
  }

  frames.push({
    state: snapshot({ activeBit: -1, multiplied: false, done: true }),
    explanation: `Gata: e = 0. ${base}^${exp}${mod > 0 ? ` mod ${mod}` : ''} = ${result}. Am făcut doar ${bits.length} pași (≈ log₂ din exponent), nu ${exp}.`,
  })

  return frames
}
