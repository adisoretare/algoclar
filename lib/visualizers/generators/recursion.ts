import type { Frame, FrameGenerator } from '../types'

export interface RecursionFrameEntry {
  n: number
  ret: number | null // null until the call returns
}

export interface RecursionState {
  stack: readonly RecursionFrameEntry[] // bottom (first call) -> top (deepest)
  phase: 'descend' | 'base' | 'ascend' | 'done'
  active: number // index in stack currently executing
  result: number | null
  done: boolean
}

export interface RecursionInput {
  n: number
}

/**
 * Visualizes the call stack of factorial(n). On the way down we push a frame
 * per call until the base case factorial(0)=1; on the way up each frame returns
 * n * factorial(n-1). The stack growing then unwinding IS the recursion.
 */
export const generateRecursion: FrameGenerator<
  RecursionInput,
  RecursionState
> = ({ n }) => {
  if (n < 1 || n > 9 || !Number.isInteger(n)) {
    throw new Error('generateRecursion: n trebuie să fie întreg între 1 și 9')
  }

  const frames: Frame<RecursionState>[] = []
  const stack: RecursionFrameEntry[] = []

  const snap = (over: Partial<RecursionState>): RecursionState => ({
    stack: stack.map(e => ({ ...e })),
    phase: 'descend',
    active: stack.length - 1,
    result: null,
    done: false,
    ...over,
  })

  // Descend: push factorial(n) .. factorial(0)
  for (let v = n; v >= 0; v--) {
    stack.push({ n: v, ret: null })
    if (v > 0) {
      frames.push({
        state: snap({ phase: 'descend', active: stack.length - 1 }),
        explanation: `factorial(${v}) are nevoie de factorial(${v - 1}) — apelăm mai adânc și punem un cadru nou pe stivă.`,
      })
    } else {
      frames.push({
        state: snap({ phase: 'base', active: stack.length - 1 }),
        explanation: `factorial(0) = 1 — cazul de bază. Aici recursivitatea se oprește și începem să ne întoarcem.`,
      })
    }
  }

  // Base case returns 1
  stack[stack.length - 1].ret = 1

  // Ascend: each frame returns n * child.ret
  for (let i = stack.length - 2; i >= 0; i--) {
    stack[i].ret = stack[i].n * (stack[i + 1].ret as number)
    frames.push({
      state: snap({ phase: 'ascend', active: i }),
      explanation: `factorial(${stack[i].n}) = ${stack[i].n} × factorial(${stack[i].n - 1}) = ${stack[i].n} × ${stack[i + 1].ret} = ${stack[i].ret}. Cadrul iese de pe stivă.`,
    })
  }

  frames.push({
    state: snap({ phase: 'done', active: 0, result: stack[0].ret, done: true }),
    explanation: `factorial(${n}) = ${stack[0].ret}. Stiva s-a golit complet — fiecare apel a fost rezolvat la întoarcere.`,
  })

  return frames
}
