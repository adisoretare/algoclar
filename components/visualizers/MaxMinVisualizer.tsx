'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { VisualizerShell } from './VisualizerShell'
import { generateMaxMinScan } from '@/lib/visualizers/generators/max-min-scan'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_ARRAY = [4, 7, 2, 9, 1, 5, 8, 3]

const LAB_FIELDS: LabField[] = [
  {
    id: 'array',
    label: 'Șirul tău',
    placeholder: 'ex: 4 7 2 9 1',
    defaultValue: '4 7 2 9 1 5 8 3',
    hint: 'Numere întregi separate prin spațiu · min 2 · max 15 valori · între -999 și 9999',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums) return 'Introdu numere întregi separate prin spațiu.'
      if (nums.length < 2) return 'Introdu cel puțin 2 valori.'
      if (nums.length > 15) return 'Maximum 15 valori.'
      if (nums.some(n => n < -999 || n > 9999))
        return 'Valorile trebuie să fie între -999 și 9999.'
      return null
    },
  },
]

export function MaxMinVisualizer() {
  const [array, setArray] = useState(DEFAULT_ARRAY)
  const frames = useMemo(() => generateMaxMinScan({ array }), [array])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [array, reset])

  const { currentIndex, maxValue, maxIndex, minValue, minIndex, done } =
    player.currentFrame.state
  const currentArray = player.currentFrame.state.array

  function handleLabSubmit(values: Record<string, string>) {
    const nums = parseIntegers(values.array ?? '')
    if (nums) setArray(nums)
  }

  return (
    <VisualizerShell
      title="Maxim și minim — o singură parcurgere"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-6 py-2">
        <div
          className="flex flex-wrap justify-center gap-2"
          role="list"
          aria-label="Șirul"
        >
          {currentArray.map((value, i) => {
            const isCurrent = i === currentIndex
            const isMax = !isCurrent && i === maxIndex
            const isMin = !isCurrent && i === minIndex

            return (
              <div key={i} role="listitem" className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-[10px] border-2 font-mono text-base font-semibold transition-all duration-200',
                    isCurrent
                      ? 'scale-110 border-primary bg-accent text-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]'
                      : isMax
                        ? 'border-success bg-success/10 text-success'
                        : isMin
                          ? 'border-warning bg-warning/10 text-warning'
                          : done
                            ? 'border-border bg-muted/60 text-muted-foreground'
                            : 'border-border bg-muted text-foreground',
                  )}
                  aria-current={isCurrent ? 'true' : undefined}
                  aria-label={`v[${i}] = ${value}${isMax ? ', maxim curent' : ''}${isMin ? ', minim curent' : ''}`}
                >
                  {value}
                </div>
                <span className="font-mono text-xs text-muted-foreground">[{i}]</span>
              </div>
            )
          })}
        </div>

        <div className="flex gap-3">
          <StatChip label="max" value={maxValue} variant="success" emphasized={done} />
          <StatChip label="min" value={minValue} variant="warning" emphasized={done} />
        </div>
      </div>
    </VisualizerShell>
  )
}

interface StatChipProps {
  label: string
  value: number
  variant: 'success' | 'warning'
  emphasized: boolean
}

function StatChip({ label, value, variant, emphasized }: StatChipProps) {
  return (
    <div
      className={cn(
        'flex min-w-[88px] flex-col items-center rounded-[10px] border px-4 py-2 transition-all duration-300',
        emphasized
          ? variant === 'success'
            ? 'border-success/40 bg-success/10'
            : 'border-warning/40 bg-warning/10'
          : 'border-border bg-muted/50',
      )}
    >
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          'font-mono text-xl font-bold tabular-nums transition-all duration-200',
          variant === 'success' ? 'text-success' : 'text-warning',
        )}
      >
        {value}
      </span>
    </div>
  )
}
