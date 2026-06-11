'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateFrequency } from '@/lib/visualizers/generators/frequency'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_ARRAY = [2, 5, 1, 2, 0, 3, 2, 5, 1, 2]

const LAB_FIELDS: LabField[] = [
  {
    id: 'array',
    label: 'Vectorul tău',
    placeholder: 'ex: 2 5 1 2 0 3 2',
    defaultValue: '2 5 1 2 0 3 2 5 1 2',
    hint: 'Numere întregi ≥ 0 separate prin spațiu · min 2 · max 20 valori · între 0 și 15',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums) return 'Introdu numere întregi separate prin spațiu.'
      if (nums.length < 2) return 'Introdu cel puțin 2 valori.'
      if (nums.length > 20) return 'Maximum 20 valori.'
      if (nums.some(n => n < 0 || n > 15))
        return 'Valorile trebuie să fie întregi între 0 și 15.'
      return null
    },
  },
]

export function FrequencyVisualizer() {
  const [array, setArray] = useState(DEFAULT_ARRAY)
  const frames = useMemo(() => generateFrequency({ array }), [array])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [array, reset])

  const { freq, currentIndex, countedValue, done } = player.currentFrame.state
  const currentArray = player.currentFrame.state.array
  const maxCount = Math.max(1, ...freq)

  function handleLabSubmit(values: Record<string, string>) {
    const nums = parseIntegers(values.array ?? '')
    if (nums) setArray(nums)
  }

  return (
    <VisualizerShell
      title="Vector de frecvență — numărăm aparițiile"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-7 py-2">
        {/* Source array */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">vector</span>
          <div
            className="flex flex-wrap justify-center gap-1.5"
            role="list"
            aria-label="Vectorul de intrare"
          >
            {currentArray.map((value, i) => {
              const isCurrent = i === currentIndex
              return (
                <div
                  key={i}
                  role="listitem"
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-[8px] border-2 font-mono text-sm font-semibold transition-all duration-200',
                    isCurrent
                      ? 'scale-110 border-primary bg-accent text-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]'
                      : done
                        ? 'border-border bg-muted/60 text-muted-foreground'
                        : 'border-border bg-muted text-foreground',
                  )}
                  aria-current={isCurrent ? 'true' : undefined}
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
          <div className="flex items-end gap-2" role="list" aria-label="Vectorul de frecvență">
            {freq.map((count, v) => {
              const isBumped = v === countedValue
              return (
                <div
                  key={v}
                  role="listitem"
                  className="flex flex-col items-center gap-1"
                >
                  <span
                    className={cn(
                      'font-mono text-xs font-semibold tabular-nums transition-colors',
                      isBumped ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    {count}
                  </span>
                  <div
                    className={cn(
                      'flex w-9 items-end justify-center rounded-[6px] transition-all duration-200',
                      isBumped ? 'bg-primary' : count > 0 ? 'bg-primary/40' : 'bg-muted',
                    )}
                    style={{ height: `${8 + (count / maxCount) * 64}px` }}
                    aria-label={`freq[${v}] = ${count}`}
                  />
                  <span
                    className={cn(
                      'flex h-7 w-9 items-center justify-center rounded-[6px] border font-mono text-xs font-semibold transition-colors',
                      isBumped
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
      </div>
    </VisualizerShell>
  )
}
