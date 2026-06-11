import type { Frame, FrameGenerator } from '../types'

export interface HeapState {
  heap: readonly number[]
  comparing: readonly [number, number] | null // [child, parent] or [parent, child]
  swapping: boolean
  active: number | null // node currently being sifted
  phase: 'insert' | 'extract' | 'done'
  removed: number | null // value just extracted
  done: boolean
}

export interface HeapInput {
  values: number[]
  extractCount: number
}

/**
 * Binary MIN-heap stored as an array (parent of i is (i-1)/2). Insert each value
 * with sift-up, then extract the minimum `extractCount` times with sift-down.
 * The smallest element is always at the root — the heart of a priority queue.
 */
export const generateHeap: FrameGenerator<HeapInput, HeapState> = ({
  values,
  extractCount,
}) => {
  if (values.length === 0) {
    throw new Error('generateHeap: nevoie de cel puțin o valoare')
  }

  const frames: Frame<HeapState>[] = []
  const heap: number[] = []

  const base = (over: Partial<HeapState>): HeapState => ({
    heap: [...heap],
    comparing: null,
    swapping: false,
    active: null,
    phase: 'insert',
    removed: null,
    done: false,
    ...over,
  })

  // Insert with sift-up
  for (const v of values) {
    heap.push(v)
    let i = heap.length - 1
    frames.push({
      state: base({ phase: 'insert', active: i }),
      explanation: `insert(${v}): punem ${v} pe ultima poziție, apoi îl urcăm cât timp e mai mic decât părintele.`,
    })
    while (i > 0) {
      const parent = (i - 1) >> 1
      frames.push({
        state: base({ phase: 'insert', active: i, comparing: [i, parent] }),
        explanation: `Comparăm ${heap[i]} cu părintele ${heap[parent]}.`,
      })
      if (heap[i] < heap[parent]) {
        ;[heap[i], heap[parent]] = [heap[parent], heap[i]]
        frames.push({
          state: base({
            phase: 'insert',
            active: parent,
            comparing: [i, parent],
            swapping: true,
          }),
          explanation: `${heap[parent]} < ${heap[i]} → interschimbăm: copilul urcă.`,
        })
        i = parent
      } else {
        frames.push({
          state: base({ phase: 'insert', active: i }),
          explanation: `${heap[i]} ≥ ${heap[parent]} → e la locul lui. Minimul rămâne în rădăcină.`,
        })
        break
      }
    }
  }

  // Extract-min with sift-down
  const k = Math.min(extractCount, values.length)
  for (let e = 0; e < k; e++) {
    const min = heap[0]
    const last = heap.pop() as number
    if (heap.length > 0) {
      heap[0] = last
    }
    frames.push({
      state: base({ phase: 'extract', removed: min, active: heap.length > 0 ? 0 : null }),
      explanation: `extract-min(): scoatem rădăcina ${min} (cel mai mic). Mutăm ultimul element în rădăcină și îl coborâm.`,
    })
    let i = 0
    while (true) {
      const l = 2 * i + 1
      const r = 2 * i + 2
      let smallest = i
      if (l < heap.length && heap[l] < heap[smallest]) smallest = l
      if (r < heap.length && heap[r] < heap[smallest]) smallest = r
      if (smallest === i) {
        if (heap.length > 0) {
          frames.push({
            state: base({ phase: 'extract', active: i }),
            explanation: `Niciun copil mai mic — heap-ul e refăcut, minimul nou e iar în rădăcină.`,
          })
        }
        break
      }
      frames.push({
        state: base({ phase: 'extract', active: i, comparing: [i, smallest] }),
        explanation: `Coborâm: ${heap[i]} > ${heap[smallest]}, interschimbăm cu cel mai mic copil.`,
      })
      ;[heap[i], heap[smallest]] = [heap[smallest], heap[i]]
      frames.push({
        state: base({
          phase: 'extract',
          active: smallest,
          comparing: [i, smallest],
          swapping: true,
        }),
        explanation: `Interschimbat.`,
      })
      i = smallest
    }
  }

  frames.push({
    state: base({ phase: 'done', done: true }),
    explanation: `Un heap ține mereu minimul în rădăcină, cu inserare și extragere în O(log n). Asta e exact ce face o coadă de priorități.`,
  })

  return frames
}
