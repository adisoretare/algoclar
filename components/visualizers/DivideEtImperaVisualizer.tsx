'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateDivideEtImpera } from '@/lib/visualizers/generators/divide-et-impera'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_ARRAY = [5, 2, 8, 1, 9, 3, 7, 4]

const LAB_FIELDS: LabField[] = [
  {
    id: 'array',
    label: 'Vectorul de sortat',
    placeholder: 'ex: 5 2 8 1 9 3',
    hint: 'Întregi separați prin spațiu · min 2 · max 12 valori',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums) return 'Introdu numere întregi.'
      if (nums.length < 2 || nums.length > 12) return 'Între 2 și 12 valori.'
      return null
    },
  },
]

export function DivideEtImperaVisualizer() {
  const [array, setArray] = useState(DEFAULT_ARRAY)
  const frames = useMemo(() => generateDivideEtImpera({ array }), [array])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [array, reset])

  const { array: current, lo, hi, mid, phase, depth, done } =
    player.currentFrame.state

  function handleLabSubmit(v: Record<string, string>) {
    const nums = parseIntegers(v.array ?? '')
    if (nums) setArray(nums)
  }

  return (
    <VisualizerShell
      title="Divide et Impera — merge sort"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'rounded-[8px] px-3 py-1 font-mono text-xs font-semibold',
              done
                ? 'bg-success/10 text-success'
                : phase === 'split'
                  ? 'bg-warning/15 text-warning'
                  : 'bg-primary/10 text-primary',
            )}
          >
            {done
              ? 'sortat'
              : phase === 'split'
                ? `împărțim [${lo}, ${hi}]`
                : `interclasăm [${lo}, ${hi}]`}
          </span>
          {!done && (
            <span className="font-mono text-[11px] text-muted-foreground">
              adâncime {depth}
            </span>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-1.5" role="list">
          {current.map((value, i) => {
            const inSegment = i >= lo && i <= hi
            const isMidEdge = phase === 'split' && mid !== null && i === mid
            return (
              <div key={i} role="listitem" className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-[8px] border-2 font-mono text-base font-semibold tabular-nums transition-all duration-200',
                    done
                      ? 'border-success bg-success/10 text-success'
                      : inSegment
                        ? phase === 'split'
                          ? 'border-warning bg-warning/10 text-warning'
                          : 'border-primary bg-accent text-primary'
                        : 'border-border bg-muted/50 text-muted-foreground',
                  )}
                >
                  {value}
                </div>
                <div
                  className={cn(
                    'h-1 w-9 rounded-full transition-colors',
                    isMidEdge ? 'bg-warning' : 'bg-transparent',
                  )}
                  aria-hidden
                />
              </div>
            )
          })}
        </div>
      </div>
    </VisualizerShell>
  )
}
