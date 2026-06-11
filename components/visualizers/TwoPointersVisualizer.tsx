'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateTwoPointers } from '@/lib/visualizers/generators/two-pointers'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_ARRAY = [2, 3, 5, 7, 8, 11, 14, 18]
const DEFAULT_TARGET = 16

const LAB_FIELDS: LabField[] = [
  {
    id: 'array',
    label: 'Vectorul tău',
    placeholder: 'ex: 2 3 5 7 8 11',
    hint: 'Se sortează automat · min 2 · max 14 valori',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums) return 'Introdu numere întregi separate prin spațiu.'
      if (nums.length < 2) return 'Introdu cel puțin 2 valori.'
      if (nums.length > 14) return 'Maximum 14 valori.'
      return null
    },
  },
  {
    id: 'target',
    label: 'Suma căutată',
    placeholder: 'ex: 16',
    hint: 'Un singur număr întreg',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums || nums.length !== 1) return 'Introdu un singur număr.'
      return null
    },
  },
]

export function TwoPointersVisualizer() {
  const [array, setArray] = useState(DEFAULT_ARRAY)
  const [target, setTarget] = useState(DEFAULT_TARGET)

  const frames = useMemo(
    () => generateTwoPointers({ array, target }),
    [array, target],
  )
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [array, target, reset])

  const { l, r, sum, found, notFound, done } = player.currentFrame.state
  const currentArray = player.currentFrame.state.array

  function handleLabSubmit(values: Record<string, string>) {
    const nums = parseIntegers(values.array ?? '')
    const t = parseIntegers(values.target ?? '')
    if (!nums || !t || t.length !== 1) return
    setArray(nums)
    setTarget(t[0])
  }

  const sumColor = found
    ? 'text-success'
    : notFound
      ? 'text-destructive'
      : sum < target
        ? 'text-warning'
        : 'text-primary'

  return (
    <VisualizerShell
      title="Doi pointeri — pereche cu sumă dată"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-6 py-2">
        {/* Target + current sum */}
        <div className="flex gap-3">
          <div className="flex min-w-[88px] flex-col items-center rounded-[10px] border border-border bg-muted/50 px-4 py-2">
            <span className="font-mono text-xs text-muted-foreground">țintă</span>
            <span className="font-mono text-xl font-bold tabular-nums text-foreground">
              {target}
            </span>
          </div>
          <div
            className={cn(
              'flex min-w-[88px] flex-col items-center rounded-[10px] border px-4 py-2 transition-colors',
              found
                ? 'border-success/40 bg-success/10'
                : notFound
                  ? 'border-destructive/40 bg-destructive/10'
                  : 'border-border bg-muted/50',
            )}
          >
            <span className="font-mono text-xs text-muted-foreground">
              v[l] + v[r]
            </span>
            <span className={cn('font-mono text-xl font-bold tabular-nums', sumColor)}>
              {currentArray[l]} + {currentArray[r]} = {sum}
            </span>
          </div>
        </div>

        {/* Array with pointers */}
        <div className="flex flex-wrap justify-center gap-1.5" role="list">
          {currentArray.map((value, i) => {
            const isL = i === l
            const isR = i === r
            const isEndpoint = isL || isR
            const outside = !done && (i < l || i > r)
            return (
              <div
                key={i}
                role="listitem"
                className="flex flex-col items-center gap-1"
              >
                <div className="flex h-4 items-end">
                  {isEndpoint && (
                    <span className="font-mono text-[10px] font-bold text-primary">
                      {isL && isR ? 'l=r' : isL ? 'l' : 'r'}
                    </span>
                  )}
                </div>
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-[8px] border-2 font-mono text-base font-semibold tabular-nums transition-all duration-200',
                    found && isEndpoint
                      ? 'scale-110 border-success bg-success/15 text-success'
                      : isEndpoint
                        ? 'scale-105 border-primary bg-accent text-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]'
                        : outside
                          ? 'border-border bg-muted/40 text-muted-foreground/50'
                          : 'border-border bg-muted text-foreground',
                  )}
                  aria-label={`v[${i}] = ${value}${isL ? ', pointer l' : ''}${isR ? ', pointer r' : ''}`}
                >
                  {value}
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  [{i}]
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </VisualizerShell>
  )
}
