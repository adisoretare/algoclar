'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateSlidingWindow } from '@/lib/visualizers/generators/sliding-window'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_ARRAY = [2, 1, 5, 1, 3, 2, 4, 6, 1]
const DEFAULT_K = 3

const LAB_FIELDS: LabField[] = [
  {
    id: 'array',
    label: 'Vectorul tău',
    placeholder: 'ex: 2 1 5 1 3 2 4',
    hint: 'Numere întregi separate prin spațiu · min 2 · max 14 valori',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums) return 'Introdu numere întregi separate prin spațiu.'
      if (nums.length < 2) return 'Introdu cel puțin 2 valori.'
      if (nums.length > 14) return 'Maximum 14 valori.'
      return null
    },
  },
  {
    id: 'k',
    label: 'Lungimea ferestrei k',
    placeholder: 'ex: 3',
    hint: 'Un număr între 1 și lungimea vectorului',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums || nums.length !== 1) return 'Introdu un singur număr.'
      if (nums[0] < 1) return 'k trebuie să fie ≥ 1.'
      return null
    },
  },
]

export function SlidingWindowVisualizer() {
  const [array, setArray] = useState(DEFAULT_ARRAY)
  const [k, setK] = useState(DEFAULT_K)

  const frames = useMemo(() => generateSlidingWindow({ array, k }), [array, k])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [array, k, reset])

  const {
    start,
    end,
    windowSum,
    bestSum,
    bestStart,
    added,
    removed,
    done,
  } = player.currentFrame.state
  const currentArray = player.currentFrame.state.array
  const bestEnd = bestStart + k - 1

  function handleLabSubmit(values: Record<string, string>) {
    const nums = parseIntegers(values.array ?? '')
    const kv = parseIntegers(values.k ?? '')
    if (!nums || !kv || kv.length !== 1) return
    if (kv[0] < 1 || kv[0] > nums.length) return
    setArray(nums)
    setK(kv[0])
  }

  return (
    <VisualizerShell
      title="Fereastră glisantă — sumă maximă pe k elemente"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-6 py-2">
        {/* Stats */}
        <div className="flex gap-3">
          <div className="flex min-w-[96px] flex-col items-center rounded-[10px] border border-border bg-muted/50 px-4 py-2">
            <span className="font-mono text-xs text-muted-foreground">
              sumă fereastră
            </span>
            <span className="font-mono text-xl font-bold tabular-nums text-primary">
              {windowSum}
            </span>
          </div>
          <div
            className={cn(
              'flex min-w-[96px] flex-col items-center rounded-[10px] border px-4 py-2 transition-colors',
              done ? 'border-success/40 bg-success/10' : 'border-border bg-muted/50',
            )}
          >
            <span className="font-mono text-xs text-muted-foreground">maxim</span>
            <span className="font-mono text-xl font-bold tabular-nums text-success">
              {bestSum}
            </span>
          </div>
        </div>

        {/* Array with window */}
        <div className="flex flex-wrap justify-center gap-1.5" role="list">
          {currentArray.map((value, i) => {
            const inWindow = i >= start && i <= end
            const inBest = i >= bestStart && i <= bestEnd
            const isAdded = i === added
            const isRemoved = i === removed
            return (
              <div
                key={i}
                role="listitem"
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-[8px] border-2 font-mono text-base font-semibold tabular-nums transition-all duration-200',
                    isAdded
                      ? 'scale-110 border-primary bg-accent text-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]'
                      : isRemoved
                        ? 'border-destructive/50 bg-destructive/10 text-destructive'
                        : done && inBest
                          ? 'border-success bg-success/15 text-success'
                          : inWindow
                            ? 'border-primary bg-accent/60 text-primary'
                            : 'border-border bg-muted text-foreground',
                  )}
                  aria-label={`v[${i}] = ${value}${inWindow ? ', în fereastră' : ''}`}
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

        {/* Best window hint */}
        {!done && (
          <span className="font-mono text-[11px] text-muted-foreground">
            cea mai bună fereastră de până acum: [{bestStart}, {bestEnd}] (sumă{' '}
            {bestSum})
          </span>
        )}
      </div>
    </VisualizerShell>
  )
}
