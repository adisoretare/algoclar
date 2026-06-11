import type { Frame, FrameGenerator } from '../types'

export interface AccesVectorState {
  array: readonly number[]
  accessIndex: number // -1 on summary frame
  accessValue: number
  done: boolean
}

export interface AccesVectorInput {
  array: number[]
}

/**
 * Generates frames that demonstrate O(1) random access on a vector.
 * Jumps between non-adjacent indices so the learner sees that order
 * does not matter — each access costs the same flat price.
 */
export const generateAccesVector: FrameGenerator<
  AccesVectorInput,
  AccesVectorState
> = ({ array }) => {
  if (array.length === 0) {
    throw new Error('generateAccesVector: vectorul nu poate fi gol')
  }

  const n = array.length

  // Candidate indices that jump around — not 0,1,2,...
  const candidates = [
    0,
    n - 1,
    Math.floor((n - 1) / 2),
    1,
    n - 2,
  ]

  // Keep only valid indices and dedupe while preserving order
  const seen = new Set<number>()
  const targets: number[] = []
  for (const idx of candidates) {
    if (idx >= 0 && idx < n && !seen.has(idx)) {
      seen.add(idx)
      targets.push(idx)
    }
  }

  const frames: Frame<AccesVectorState>[] = []

  for (const idx of targets) {
    const val = array[idx]
    frames.push({
      state: {
        array,
        accessIndex: idx,
        accessValue: val,
        done: false,
      },
      explanation: `Acces direct: v[${idx}] = ${val}. Sari direct la poziția ${idx}, fără să parcurgi restul — O(1).`,
    })
  }

  // Summary frame
  frames.push({
    state: {
      array,
      accessIndex: -1,
      accessValue: 0,
      done: true,
    },
    explanation:
      'Indiferent de poziție, accesul costă la fel — O(1). Asta face vectorul puternic.',
  })

  return frames
}
