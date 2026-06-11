'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateCountingSort } from '@/lib/visualizers/generators/counting-sort'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_ARRAY = [4, 1, 2, 1, 0, 4, 2, 3, 1]

const LAB_FIELDS: LabField[] = [
  {
    id: 'array',
    label: 'Vectorul tău',
    placeholder: 'ex: 4 1 2 1 0 4 2',
    defaultValue: '4 1 2 1 0 4 2 3 1',
    hint: 'Numere întregi ≥ 0 separate prin spațiu · min 2 · max 16 valori · între 0 și 12',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums) return 'Introdu numere întregi separate prin spațiu.'
      if (nums.length < 2) return 'Introdu cel puțin 2 valori.'
      if (nums.length > 16) return 'Maximum 16 valori.'
      if (nums.some(n => n < 0 || n > 12))
        return 'Valorile trebuie să fie întregi între 0 și 12.'
      return null
    },
  },
]

export function CountingSortVisualizer() {
  const [array, setArray] = useState(DEFAULT_ARRAY)
  const frames = useMemo(() => generateCountingSort({ array }), [array])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [array, reset])

  const { freq, output, phase, countIndex, emitValue, done } =
    player.currentFrame.state
  const sourceArray = player.currentFrame.state.array
  const maxCount = Math.max(1, ...freq)

  function handleLabSubmit(values: Record<string, string>) {
    const nums = parseIntegers(values.array ?? '')
    if (nums) setArray(nums)
  }

  return (
    <VisualizerShell
      title="Sortare prin numărare — fără comparații"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-6 py-2">
        {/* Source array */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            vector inițial
          </span>
          <div className="flex flex-wrap justify-center gap-1.5" role="list">
            {sourceArray.map((value, i) => {
              const isCurrent = phase === 'count' && i === countIndex
              return (
                <div
                  key={i}
                  role="listitem"
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-[8px] border-2 font-mono text-sm font-semibold transition-all duration-200',
                    isCurrent
                      ? 'scale-110 border-primary bg-accent text-primary'
                      : 'border-border bg-muted text-foreground',
                  )}
                  aria-label={`v[${i}] = ${value}`}
                >
                  {value}
                </div>
              )
            })}
          </div>
        </div>

        {/* Frequency buckets */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            freq[valoare]
          </span>
          <div className="flex items-end gap-1.5" role="list">
            {freq.map((count, v) => {
              const isActive =
                (phase === 'count' &&
                  countIndex >= 0 &&
                  sourceArray[countIndex] === v) ||
                (phase === 'emit' && v === emitValue)
              return (
                <div key={v} role="listitem" className="flex flex-col items-center gap-1">
                  <span
                    className={cn(
                      'font-mono text-xs font-semibold tabular-nums transition-colors',
                      isActive ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    {count}
                  </span>
                  <div
                    className={cn(
                      'w-8 rounded-[6px] transition-all duration-200',
                      isActive ? 'bg-primary' : count > 0 ? 'bg-primary/40' : 'bg-muted',
                    )}
                    style={{ height: `${8 + (count / maxCount) * 52}px` }}
                    aria-label={`freq[${v}] = ${count}`}
                  />
                  <span
                    className={cn(
                      'flex h-6 w-8 items-center justify-center rounded-[6px] border font-mono text-xs font-semibold transition-colors',
                      isActive
                        ? 'border-primary bg-accent text-primary'
                        : 'border-border bg-muted text-foreground',
                    )}
                  >
                    {v}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Output */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            rezultat sortat
          </span>
          <div
            className="flex min-h-[40px] flex-wrap justify-center gap-1.5"
            role="list"
            aria-label="Vectorul sortat"
          >
            {sourceArray.map((_, i) => {
              const value = output[i]
              const filled = i < output.length
              const justAdded = filled && i === output.length - 1 && !done
              return (
                <div
                  key={i}
                  role="listitem"
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-[8px] border-2 font-mono text-sm font-semibold transition-all duration-200',
                    !filled
                      ? 'border-dashed border-border bg-transparent text-muted-foreground/30'
                      : justAdded
                        ? 'scale-110 border-success bg-success/10 text-success'
                        : 'border-success/40 bg-success/5 text-success',
                  )}
                  aria-label={filled ? `sortat[${i}] = ${value}` : `poziția ${i} goală`}
                >
                  {filled ? value : ''}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </VisualizerShell>
  )
}
