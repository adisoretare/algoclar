'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { VisualizerShell } from './VisualizerShell'
import { generateArrayTraversal } from '@/lib/visualizers/generators/array-traversal'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_ARRAY = [3, 7, 2, 9, 1, 5, 8, 4]

const LAB_FIELDS: LabField[] = [
  {
    id: 'array',
    label: 'Vectorul tău',
    placeholder: 'ex: 3 7 1 9 4',
    defaultValue: '3 7 2 9 1 5 8 4',
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

export function ArrayVisualizer() {
  const [array, setArray] = useState(DEFAULT_ARRAY)
  const frames = useMemo(() => generateArrayTraversal({ array }), [array])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [array, reset])

  const { currentIndex, maxValue, maxIndex, sum, done } =
    player.currentFrame.state
  const currentArray = player.currentFrame.state.array

  function handleLabSubmit(values: Record<string, string>) {
    const nums = parseIntegers(values.array ?? '')
    if (nums) setArray(nums)
  }

  return (
    <VisualizerShell
      title="Parcurgerea unui vector — max și sumă"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-6 py-2">
        {/* Array cells */}
        <div
          className="flex flex-wrap justify-center gap-2"
          role="list"
          aria-label="Vectorul v"
        >
          {currentArray.map((value, i) => {
            const isCurrent = i === currentIndex
            const isMax = !isCurrent && i === maxIndex

            return (
              <div
                key={i}
                role="listitem"
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-[10px] border-2 font-mono text-base font-semibold transition-all duration-200',
                    isCurrent
                      ? 'scale-110 border-primary bg-accent text-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]'
                      : isMax
                        ? 'border-success bg-success/10 text-success'
                        : done
                          ? 'border-border bg-muted/60 text-muted-foreground'
                          : 'border-border bg-muted text-foreground',
                  )}
                  aria-current={isCurrent ? 'true' : undefined}
                  aria-label={`v[${i}] = ${value}${isCurrent ? ', vizitat acum' : ''}${isMax ? ', maxim curent' : ''}`}
                >
                  {value}
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  [{i}]
                </span>
              </div>
            )
          })}
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <StatChip label="max" value={maxValue} variant="success" emphasized={done} />
          <StatChip label="sumă" value={sum} variant="primary" emphasized={done} />
        </div>
      </div>
    </VisualizerShell>
  )
}

interface StatChipProps {
  label: string
  value: number
  variant: 'primary' | 'success'
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
            : 'border-primary/30 bg-primary/10'
          : 'border-border bg-muted/50',
      )}
    >
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          'font-mono text-xl font-bold tabular-nums transition-all duration-200',
          variant === 'success' ? 'text-success' : 'text-primary',
        )}
      >
        {value}
      </span>
    </div>
  )
}
