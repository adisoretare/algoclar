import type { Frame, FrameGenerator } from '../types'

export type SieveStatus = 'unknown' | 'prime' | 'composite'

export interface SieveState {
  /** Status pentru fiecare număr 2..n. statuses[v] descrie numărul v. */
  statuses: readonly SieveStatus[]
  /** Primul de la 2; lungimea = n + 1 (indicii 0 și 1 nu se folosesc). */
  n: number
  /** Numărul prim p procesat în acest cadru, sau -1. */
  p: number
  /** Multiplul tăiat chiar acum, sau -1. */
  multiple: number
  /** Lista primelor confirmate până acum. */
  primes: readonly number[]
  done: boolean
}

export interface SieveInput {
  n: number
}

/**
 * Ciurul lui Eratostene clasic peste 2..n.
 *
 * Pentru p = 2, 3, … cât timp p*p ≤ n: dacă p e încă prim, tăiem multiplii
 * p*p, p*p+p, … marcându-i drept compuși. Numerele rămase netăiate sunt prime.
 *
 *  - un cadru când se selectează un nou prim p,
 *  - un cadru pentru fiecare multiplu tăiat,
 *  - un cadru final cu lista primelor.
 */
export const generateSieve: FrameGenerator<SieveInput, SieveState> = ({ n }) => {
  if (n < 2) {
    throw new Error('generateSieve: n trebuie să fie cel puțin 2')
  }
  if (n > 120) {
    throw new Error('generateSieve: n trebuie să fie cel mult 120')
  }

  // statuses[v] pentru v = 0..n. Pornim 2..n ca 'unknown'.
  const statuses: SieveStatus[] = new Array<SieveStatus>(n + 1).fill('unknown')
  statuses[0] = 'composite'
  statuses[1] = 'composite'

  const frames: Frame<SieveState>[] = []

  function snapshot(
    p: number,
    multiple: number,
    explanation: string,
  ): void {
    const primes: number[] = []
    for (let v = 2; v <= n; v++) {
      if (statuses[v] === 'prime') primes.push(v)
    }
    frames.push({
      state: {
        statuses: [...statuses],
        n,
        p,
        multiple,
        primes,
        done: false,
      },
      explanation,
    })
  }

  for (let p = 2; p * p <= n; p++) {
    // Dacă p a fost deja tăiat ca multiplu, nu e prim — îl sărim.
    if (statuses[p] === 'composite') continue

    // p este prim — îl confirmăm.
    statuses[p] = 'prime'
    snapshot(
      p,
      -1,
      `${p} este prim (nu a fost tăiat). Începem să tăiem multiplii lui ${p}, pornind de la ${p}² = ${p * p}.`,
    )

    for (let m = p * p; m <= n; m += p) {
      if (statuses[m] === 'composite') {
        snapshot(
          p,
          m,
          `${m} = ${p} × ${m / p} era deja tăiat de un prim mai mic. Trecem mai departe.`,
        )
        continue
      }
      statuses[m] = 'composite'
      snapshot(
        p,
        m,
        `Tăiem ${m} = ${p} × ${m / p}: este multiplu al lui ${p}, deci compus.`,
      )
    }
  }

  // Tot ce a rămas 'unknown' este prim (niciun prim ≤ √n nu l-a tăiat).
  for (let v = 2; v <= n; v++) {
    if (statuses[v] === 'unknown') statuses[v] = 'prime'
  }

  const primes: number[] = []
  for (let v = 2; v <= n; v++) {
    if (statuses[v] === 'prime') primes.push(v)
  }

  frames.push({
    state: {
      statuses: [...statuses],
      n,
      p: -1,
      multiple: -1,
      primes,
      done: true,
    },
    explanation: `Gata! Numerele netăiate sunt prime. Am găsit ${primes.length} numere prime până la ${n}: ${primes.join(', ')}.`,
  })

  return frames
}
