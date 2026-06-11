'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateStack } from '@/lib/visualizers/generators/stack'
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

export function StackVisualizer() {
  const [values, setValues] = useState(DEFAULT_VALUES)
  const frames = useMemo(() => generateStack({ values }), [values])
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
      title="Stivă (stack) — LIFO"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-3 py-2">
        <span
          className={cn(
            'rounded-[8px] px-3 py-1 font-mono text-xs font-semibold transition-colors',
            op === 'push'
              ? 'bg-primary/10 text-primary'
              : op === 'pop'
                ? 'bg-destructive/10 text-destructive'
                : 'bg-muted text-muted-foreground',
          )}
        >
          {op === 'push'
            ? `push(${highlight})`
            : op === 'pop'
              ? `pop() → ${highlight}`
              : done
                ? 'gol'
                : 'stivă'}
        </span>

        <div className="flex w-32 flex-col-reverse items-stretch gap-1.5">
          {items.length === 0 && (
            <div className="flex h-12 items-center justify-center rounded-[8px] border-2 border-dashed border-border font-mono text-xs text-muted-foreground/50">
              gol
            </div>
          )}
          {items.map((value, i) => {
            const isTop = i === items.length - 1
            return (
              <div
                key={i}
                className={cn(
                  'flex h-12 items-center justify-center rounded-[8px] border-2 font-mono text-base font-semibold tabular-nums transition-all duration-200',
                  isTop && op === 'push'
                    ? 'scale-105 border-primary bg-accent text-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]'
                    : isTop
                      ? 'border-primary/50 bg-accent/60 text-primary'
                      : 'border-border bg-muted text-foreground',
                )}
              >
                {value}
                {isTop && (
                  <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                    ← vârf
                  </span>
                )}
              </div>
            )
          })}
          <div className="mt-0.5 h-1 rounded-full bg-border" aria-hidden />
          <span className="text-center font-mono text-[10px] text-muted-foreground">
            bază
          </span>
        </div>
      </div>
    </VisualizerShell>
  )
}
