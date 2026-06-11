'use client'

import { useMemo, useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateKadane } from '@/lib/visualizers/generators/kadane'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_ARRAY = [-2, 1, -3, 4, -1, 2, 1, -5, 4]

const LAB_FIELDS: LabField[] = [
  {
    id: 'array',
    label: 'Vectorul tău',
    placeholder: 'ex: -2 1 -3 4 -1 2 1',
    hint: 'Numere întregi (și negative!) separate prin spațiu · min 2 · max 16 · între -99 și 99',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums) return 'Introdu numere întregi separate prin spațiu.'
      if (nums.length < 2) return 'Introdu cel puțin 2 valori.'
      if (nums.length > 16) return 'Maximum 16 valori.'
      if (nums.some(n => n < -99 || n > 99))
        return 'Valorile trebuie să fie între -99 și 99.'
      return null
    },
  },
]

export function KadaneVisualizer() {
  const [array, setArray] = useState(DEFAULT_ARRAY)
  const frames = useMemo(() => generateKadane({ array }), [array])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [array, reset])

  const {
    index,
    current,
    best,
    curStart,
    bestStart,
    bestEnd,
    restarted,
    done,
  } = player.currentFrame.state
  const currentArray = player.currentFrame.state.array

  function handleLabSubmit(values: Record<string, string>) {
    const nums = parseIntegers(values.array ?? '')
    if (nums) setArray(nums)
  }

  return (
    <VisualizerShell
      title="Secvența de sumă maximă — Kadane"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-6 py-2">
        {/* Stats */}
        <div className="flex gap-3">
          <div className="flex min-w-[104px] flex-col items-center rounded-[10px] border border-border bg-muted/50 px-4 py-2">
            <span className="font-mono text-xs text-muted-foreground">
              sumă curentă
            </span>
            <span
              className={cn(
                'font-mono text-xl font-bold tabular-nums',
                current < 0 ? 'text-destructive' : 'text-primary',
              )}
            >
              {current}
            </span>
          </div>
          <div
            className={cn(
              'flex min-w-[104px] flex-col items-center rounded-[10px] border px-4 py-2 transition-colors',
              done ? 'border-success/40 bg-success/10' : 'border-border bg-muted/50',
            )}
          >
            <span className="font-mono text-xs text-muted-foreground">
              sumă maximă
            </span>
            <span className="font-mono text-xl font-bold tabular-nums text-success">
              {best}
            </span>
          </div>
        </div>

        {/* Array */}
        <div className="flex flex-wrap justify-center gap-1.5" role="list">
          {currentArray.map((value, i) => {
            const isCurrent = !done && i === index
            const inRunning = !done && i >= curStart && i <= index
            const inBest = i >= bestStart && i <= bestEnd

            return (
              <div
                key={i}
                role="listitem"
                className="flex flex-col items-center gap-1"
              >
                {/* restart marker */}
                <div className="flex h-4 items-center">
                  {isCurrent && restarted && (
                    <RotateCcw className="h-3 w-3 text-destructive" aria-hidden />
                  )}
                </div>

                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-[8px] border-2 font-mono text-base font-semibold tabular-nums transition-all duration-200',
                    isCurrent
                      ? 'scale-110 border-primary bg-accent text-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]'
                      : done && inBest
                        ? 'border-success bg-success/15 text-success'
                        : inRunning
                          ? 'border-primary/40 bg-accent/50 text-primary'
                          : 'border-border bg-muted text-foreground',
                  )}
                  aria-label={`v[${i}] = ${value}${isCurrent ? ', element curent' : ''}${inBest ? ', în secvența maximă' : ''}`}
                >
                  {value}
                </div>

                {/* best-window underline */}
                <div
                  className={cn(
                    'h-1 w-9 rounded-full transition-colors duration-200',
                    inBest ? 'bg-success' : 'bg-transparent',
                  )}
                  aria-hidden
                />

                <span className="font-mono text-[10px] text-muted-foreground">
                  [{i}]
                </span>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-[3px] border-2 border-primary/40 bg-accent/50" />
            secvența curentă
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1 w-3 rounded-full bg-success" />
            secvența maximă
          </span>
          <span className="flex items-center gap-1.5">
            <RotateCcw className="h-3 w-3 text-destructive" />
            repornire
          </span>
        </div>
      </div>
    </VisualizerShell>
  )
}
