'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateDeque } from '@/lib/visualizers/generators/deque'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_VALUES = [3, 7, 1, 9, 5]

const LAB_FIELDS: LabField[] = [
  {
    id: 'values',
    label: 'Valori (intră alternativ în față/spate)',
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

const OP_LABEL: Record<string, string> = {
  pushFront: 'pushFront',
  pushBack: 'pushBack',
  popFront: 'popFront',
  popBack: 'popBack',
}

export function DequeVisualizer() {
  const [values, setValues] = useState(DEFAULT_VALUES)
  const frames = useMemo(() => generateDeque({ values }), [values])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [values, reset])

  const { items, op, highlight, side, done } = player.currentFrame.state
  const isPush = op === 'pushFront' || op === 'pushBack'

  function handleLabSubmit(v: Record<string, string>) {
    const nums = parseIntegers(v.values ?? '')
    if (nums) setValues(nums)
  }

  return (
    <VisualizerShell
      title="Deque — adăugări și scoateri la ambele capete"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-4 py-2">
        <span
          className={cn(
            'rounded-[8px] px-3 py-1 font-mono text-xs font-semibold transition-colors',
            isPush
              ? 'bg-primary/10 text-primary'
              : op
                ? 'bg-destructive/10 text-destructive'
                : 'bg-muted text-muted-foreground',
          )}
        >
          {op
            ? `${OP_LABEL[op]}${isPush ? `(${highlight})` : `() → ${highlight}`}`
            : done
              ? 'gol'
              : 'deque'}
        </span>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-semibold text-muted-foreground">
            față
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
              const active =
                (side === 'front' && isFront && isPush) ||
                (side === 'back' && isBack && isPush)
              return (
                <div
                  key={i}
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-[8px] border-2 font-mono text-base font-semibold tabular-nums transition-all duration-200',
                    active
                      ? 'scale-105 border-primary bg-accent text-primary'
                      : (isFront || isBack)
                        ? 'border-primary/40 bg-accent/50 text-primary'
                        : 'border-border bg-muted text-foreground',
                  )}
                >
                  {value}
                </div>
              )
            })}
          </div>
          <span className="font-mono text-[10px] font-semibold text-muted-foreground">
            spate
          </span>
        </div>
      </div>
    </VisualizerShell>
  )
}
