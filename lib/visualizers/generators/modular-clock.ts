import type { Frame, FrameGenerator } from '../types'

export type ModularClockOp = 'rest' | 'adunare' | 'scadere' | 'inmultire'

export interface ModularClockState {
  /** Size of the dial (positions 0..m-1). */
  m: number
  /** Current highlighted position on the dial (0..m-1), or -1 on intro. */
  position: number
  /** The value being built up as we walk around the dial. */
  value: number
  op: ModularClockOp
  a: number
  b: number
  /** Final result; -1 until the final frame. */
  result: number
  done: boolean
}

export interface ModularClockInput {
  a: number
  b: number
  m: number
  op: ModularClockOp
}

const MAX_STEPS = 400

/**
 * Builds frames that walk a value around a modular clock (dial of size m),
 * one unit-step per frame, illustrating modular arithmetic by "wrapping".
 *
 * - 'rest':      walk `a` units forward from 0 → final position = a % m (ignores b)
 * - 'adunare':   start at a%m, walk +b → (a + b) % m
 * - 'scadere':   start at a%m, walk -b → ((a - b) % m + m) % m
 * - 'inmultire': repeated addition of a, b times → (a * b) % m
 */
export const generateModularClock: FrameGenerator<
  ModularClockInput,
  ModularClockState
> = ({ a, b, m, op }) => {
  if (m < 2 || m > 24) {
    throw new Error('Modulul m trebuie să fie între 2 și 24.')
  }
  if (a < 0 || b < 0) {
    throw new Error('Valorile a și b trebuie să fie pozitive (≥ 0).')
  }
  if (a > 1000 || b > 1000) {
    throw new Error('Valorile a și b trebuie să fie cel mult 1000.')
  }

  // Total number of unit-steps around the dial for this operation.
  const totalSteps =
    op === 'rest'
      ? a
      : op === 'inmultire'
        ? a * b
        : b
  if (totalSteps > MAX_STEPS) {
    throw new Error(
      `Prea mulți pași pe cadran (${totalSteps}). Maximum ${MAX_STEPS} — alege valori mai mici.`,
    )
  }

  const frames: Frame<ModularClockState>[] = []
  const mod = (x: number) => ((x % m) + m) % m

  const base = (overrides: Partial<ModularClockState>): ModularClockState => ({
    m,
    position: -1,
    value: 0,
    op,
    a,
    b,
    result: -1,
    done: false,
    ...overrides,
  })

  if (op === 'rest') {
    const result = mod(a)
    // Intro
    frames.push({
      state: base({ position: mod(0), value: 0 }),
      explanation: `Cadran de mărime ${m}: pozițiile 0…${m - 1}. Mergem ${a} pași de la 0 și vedem unde aterizăm.`,
    })
    let value = 0
    for (let step = 1; step <= a; step++) {
      value = step
      const pos = mod(value)
      const wrapped = value > 0 && pos === 0
      frames.push({
        state: base({ position: pos, value }),
        explanation: wrapped
          ? `Pasul ${step}: am numărat ${value}, dar trecem de ${m} și ne întoarcem la 0.`
          : `Pasul ${step}: poziția ${pos} pe cadran.`,
      })
    }
    // Final
    frames.push({
      state: base({ position: result, value: a, result, done: true }),
      explanation: `${a} mod ${m} = ${result}. După ${a} pași pe un cadran de ${m}, ne oprim la ${result}.`,
    })
    return frames
  }

  if (op === 'adunare' || op === 'scadere') {
    const start = mod(a)
    const sign = op === 'adunare' ? 1 : -1
    const result = mod(a + sign * b)
    const verb = op === 'adunare' ? 'adăugăm' : 'scădem'
    const dir = op === 'adunare' ? 'înainte' : 'înapoi'

    // Intro: positioned at a%m
    frames.push({
      state: base({ position: start, value: a }),
      explanation: `Pornim de la ${a} mod ${m} = ${start}. Acum ${verb} ${b}, mergând ${dir} pe cadran.`,
    })
    let pos = start
    for (let step = 1; step <= b; step++) {
      pos = mod(pos + sign)
      const wrapped =
        (op === 'adunare' && pos === 0) ||
        (op === 'scadere' && pos === m - 1)
      frames.push({
        state: base({ position: pos, value: a + sign * step }),
        explanation: wrapped
          ? `Pasul ${step}: ${dir === 'înainte' ? 'trecem de ' + m + ' și revenim la 0' : 'trecem de 0 și sărim la ' + (m - 1)} → poziția ${pos}.`
          : `Pasul ${step}: ${dir} la poziția ${pos}.`,
      })
    }
    // Final
    const expr =
      op === 'adunare'
        ? `(${a} + ${b}) mod ${m}`
        : `(${a} - ${b}) mod ${m}`
    frames.push({
      state: base({ position: result, value: a + sign * b, result, done: true }),
      explanation: `${expr} = ${result}. Ne oprim la ${result} pe cadran.`,
    })
    return frames
  }

  // op === 'inmultire': repeated addition of a, b times
  const result = mod(a * b)
  frames.push({
    state: base({ position: mod(0), value: 0 }),
    explanation: `Înmulțirea ${a} × ${b} mod ${m} înseamnă să adunăm ${a} de ${b} ori pe cadran. Pornim de la 0.`,
  })
  let value = 0
  let pos = 0
  for (let rep = 1; rep <= b; rep++) {
    for (let k = 1; k <= a; k++) {
      value += 1
      pos = mod(pos + 1)
      const wrapped = pos === 0
      const lastOfRep = k === a
      frames.push({
        state: base({ position: pos, value }),
        explanation: lastOfRep
          ? `Am adunat ${a} (runda ${rep} din ${b}): suntem la poziția ${pos}.`
          : wrapped
            ? `Trecem de ${m} și revenim la 0 (poziția ${pos}).`
            : `+1 → poziția ${pos}.`,
      })
    }
  }
  frames.push({
    state: base({ position: result, value: a * b, result, done: true }),
    explanation: `${a} × ${b} mod ${m} = ${result}. După ${b} runde de câte ${a}, ne oprim la ${result}.`,
  })
  return frames
}
