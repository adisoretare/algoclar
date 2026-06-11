'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateHeap } from '@/lib/visualizers/generators/heap'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_VALUES = [5, 3, 8, 1, 9, 2, 7]
const EXTRACT_COUNT = 2

const LAB_FIELDS: LabField[] = [
  {
    id: 'values',
    label: 'Valori de inserat în heap',
    placeholder: 'ex: 5 3 8 1 9 2',
    defaultValue: '5 3 8 1 9 2 7',
    hint: 'Întregi separați prin spațiu · min 1 · max 12 valori',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums) return 'Introdu numere întregi.'
      if (nums.length < 1 || nums.length > 12) return 'Între 1 și 12 valori.'
      return null
    },
  },
]

function nodeClass(
  i: number,
  active: number | null,
  comparing: readonly [number, number] | null,
  swapping: boolean,
) {
  const inCompare = comparing !== null && (i === comparing[0] || i === comparing[1])
  if (inCompare && swapping) return 'border-destructive bg-destructive/15 text-destructive'
  if (inCompare) return 'border-warning bg-warning/15 text-warning'
  if (i === active) return 'border-primary bg-accent text-primary scale-110'
  if (i === 0) return 'border-success/50 bg-success/10 text-success'
  return 'border-border bg-muted text-foreground'
}

export function HeapVisualizer() {
  const [values, setValues] = useState(DEFAULT_VALUES)
  const frames = useMemo(
    () => generateHeap({ values, extractCount: EXTRACT_COUNT }),
    [values],
  )
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [values, reset])

  const { heap, comparing, swapping, active, phase, removed } =
    player.currentFrame.state

  // Group indices by tree level: level L holds indices [2^L - 1, 2^(L+1) - 2]
  const levels: number[][] = []
  for (let i = 0; i < heap.length; i++) {
    const level = Math.floor(Math.log2(i + 1))
    ;(levels[level] ??= []).push(i)
  }

  function handleLabSubmit(v: Record<string, string>) {
    const nums = parseIntegers(v.values ?? '')
    if (nums) setValues(nums)
  }

  return (
    <VisualizerShell
      title="Heap binar (min) — coadă de priorități"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-5 py-2">
        <span
          className={cn(
            'rounded-[8px] px-3 py-1 font-mono text-xs font-semibold',
            phase === 'extract'
              ? 'bg-destructive/10 text-destructive'
              : 'bg-primary/10 text-primary',
          )}
        >
          {removed !== null
            ? `extract-min() → ${removed}`
            : phase === 'extract'
              ? 'extragere'
              : phase === 'done'
                ? 'gata'
                : 'inserare'}
        </span>

        {/* Tree */}
        <div className="flex flex-col items-center gap-3">
          {levels.map((row, l) => (
            <div key={l} className="flex justify-center gap-3">
              {row.map(i => (
                <div
                  key={i}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 font-mono text-sm font-semibold tabular-nums transition-all duration-200',
                    nodeClass(i, active, comparing, swapping),
                  )}
                  aria-label={`heap[${i}] = ${heap[i]}`}
                >
                  {heap[i]}
                </div>
              ))}
            </div>
          ))}
          {heap.length === 0 && (
            <span className="font-mono text-xs text-muted-foreground/50">heap gol</span>
          )}
        </div>

        {/* Array view */}
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[10px] text-muted-foreground">
            stocat ca vector
          </span>
          <div className="flex flex-wrap justify-center gap-1">
            {heap.map((value, i) => (
              <div
                key={i}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-[6px] border font-mono text-xs tabular-nums transition-colors',
                  i === active
                    ? 'border-primary bg-accent text-primary'
                    : 'border-border bg-muted text-muted-foreground',
                )}
              >
                {value}
              </div>
            ))}
          </div>
        </div>
      </div>
    </VisualizerShell>
  )
}
