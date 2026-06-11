'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { VisualizerShell } from './VisualizerShell'
import { generateAccesVector } from '@/lib/visualizers/generators/acces-vector'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_ARRAY = [5, 3, 8, 1, 9, 2, 7]

const LAB_FIELDS: LabField[] = [
  {
    id: 'array',
    label: 'Vectorul tău',
    placeholder: 'ex: 5 3 8 1 9 2 7',
    defaultValue: '5 3 8 1 9 2 7',
    hint: 'Numere întregi separate prin spațiu · min 1 · max 15 valori · între -999 și 9999',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums) return 'Introdu numere întregi separate prin spațiu.'
      if (nums.length < 1) return 'Introdu cel puțin 1 valoare.'
      if (nums.length > 15) return 'Maximum 15 valori.'
      if (nums.some(n => n < -999 || n > 9999))
        return 'Valorile trebuie să fie între -999 și 9999.'
      return null
    },
  },
]

export function AccesVectorVisualizer() {
  const [array, setArray] = useState(DEFAULT_ARRAY)
  const frames = useMemo(() => generateAccesVector({ array }), [array])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [array, reset])

  const { accessIndex, accessValue, done } = player.currentFrame.state
  const currentArray = player.currentFrame.state.array

  function handleLabSubmit(values: Record<string, string>) {
    const nums = parseIntegers(values.array ?? '')
    if (nums) setArray(nums)
  }

  return (
    <VisualizerShell
      title="Acces direct prin index — O(1)"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-6 py-2">
        <div
          className="flex flex-wrap justify-center gap-2"
          role="list"
          aria-label="Vectorul"
        >
          {currentArray.map((value, i) => {
            const isAccessed = i === accessIndex

            return (
              <div key={i} role="listitem" className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-[10px] border-2 font-mono text-base font-semibold transition-all duration-200',
                    isAccessed
                      ? 'scale-110 border-primary bg-accent text-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]'
                      : done
                        ? 'border-border bg-muted/60 text-muted-foreground'
                        : 'border-border bg-muted text-foreground',
                  )}
                  aria-current={isAccessed ? 'true' : undefined}
                  aria-label={`v[${i}] = ${value}${isAccessed ? ', accesat' : ''}`}
                >
                  {value}
                </div>
                <span className="font-mono text-xs text-muted-foreground">[{i}]</span>
              </div>
            )
          })}
        </div>

        <div className="flex gap-3">
          <StatChip
            label="v[k]"
            value={accessIndex >= 0 ? accessValue : '—'}
            variant="primary"
            emphasized={accessIndex >= 0}
          />
          <StatChip
            label="index"
            value={accessIndex >= 0 ? accessIndex : '—'}
            variant="primary"
            emphasized={accessIndex >= 0}
          />
        </div>
      </div>
    </VisualizerShell>
  )
}

interface StatChipProps {
  label: string
  value: number | string
  variant: 'primary'
  emphasized: boolean
}

function StatChip({ label, value, variant, emphasized }: StatChipProps) {
  return (
    <div
      className={cn(
        'flex min-w-[88px] flex-col items-center rounded-[10px] border px-4 py-2 transition-all duration-300',
        emphasized && variant === 'primary'
          ? 'border-primary/40 bg-accent'
          : 'border-border bg-muted/50',
      )}
    >
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          'font-mono text-xl font-bold tabular-nums transition-all duration-200',
          variant === 'primary' ? 'text-primary' : 'text-foreground',
        )}
      >
        {value}
      </span>
    </div>
  )
}
