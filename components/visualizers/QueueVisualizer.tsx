'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateQueue } from '@/lib/visualizers/generators/queue'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_VALUES = [3, 7, 1, 9, 5]

const LAB_FIELDS: LabField[] = [
  {
    id: 'values',
    label: 'Valori (se adaugă, apoi se scot)',
    placeholder: 'ex: 3 7 1 9',
    defaultValue: '3 7 1 9 5',
    hint: 'Numere întregi separate prin spațiu · min 1 · max 8 valori',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums) return 'Introdu numere întregi separate prin spațiu.'
      if (nums.length < 1) return 'Introdu cel puțin o valoare.'
      if (nums.length > 8) return 'Maximum 8 valori.'
      return null
    },
  },
]

export function QueueVisualizer() {
  const [values, setValues] = useState(DEFAULT_VALUES)
  const frames = useMemo(() => generateQueue({ values }), [values])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [values, reset])

  const { items, op, highlight, done } = player.currentFrame.state

  function handleLabSubmit(v: Record<string, string>) {
    const nums = parseIntegers(v.values ?? '')
    if (nums) setValues(nums)
  }

  return (
    <VisualizerShell
      title="Coadă (queue) — FIFO"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-4 py-2">
        <span
          className={cn(
            'rounded-[8px] px-3 py-1 font-mono text-xs font-semibold transition-colors',
            op === 'enqueue'
              ? 'bg-primary/10 text-primary'
              : op === 'dequeue'
                ? 'bg-destructive/10 text-destructive'
                : 'bg-muted text-muted-foreground',
          )}
        >
          {op === 'enqueue'
            ? `enqueue(${highlight})`
            : op === 'dequeue'
              ? `dequeue() → ${highlight}`
              : done
                ? 'goală'
                : 'coadă'}
        </span>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-muted-foreground">
            față →
          </span>
          <div className="flex min-h-[48px] items-center gap-1.5">
            {items.length === 0 && (
              <div className="flex h-12 w-12 items-center justify-center rounded-[8px] border-2 border-dashed border-border font-mono text-xs text-muted-foreground/50">
                gol
              </div>
            )}
            {items.map((value, i) => {
              const isFront = i === 0
              const isBack = i === items.length - 1
              return (
                <div
                  key={i}
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-[8px] border-2 font-mono text-base font-semibold tabular-nums transition-all duration-200',
                    isBack && op === 'enqueue'
                      ? 'scale-105 border-primary bg-accent text-primary'
                      : isFront
                        ? 'border-primary/50 bg-accent/60 text-primary'
                        : 'border-border bg-muted text-foreground',
                  )}
                >
                  {value}
                </div>
              )
            })}
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">
            → spate
          </span>
        </div>
      </div>
    </VisualizerShell>
  )
}
