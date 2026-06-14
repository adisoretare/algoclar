'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { VisualizerShell } from './VisualizerShell'
import { generateLinearSearch } from '@/lib/visualizers/generators/linear-search'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_ARRAY = [5, 3, 8, 1, 9, 2, 7]
const DEFAULT_TARGET = 9

const LAB_FIELDS: LabField[] = [
  {
    id: 'array',
    label: 'Vectorul tău',
    placeholder: 'ex: 5 3 8 1 9 2 7',
    defaultValue: '5 3 8 1 9 2 7',
    hint: 'Numere întregi separate prin spațiu · min 1 · max 20 valori · între -999 și 9999',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums) return 'Introdu numere întregi separate prin spațiu.'
      if (nums.length < 1) return 'Introdu cel puțin 1 valoare.'
      if (nums.length > 20) return 'Maximum 20 de valori.'
      if (nums.some(n => n < -999 || n > 9999))
        return 'Valorile trebuie să fie între -999 și 9999.'
      return null
    },
  },
  {
    id: 'target',
    label: 'Valoarea căutată',
    placeholder: 'ex: 9',
    defaultValue: '9',
    hint: 'Un singur număr întreg, între -999 și 9999.',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums) return 'Introdu un număr întreg.'
      if (nums.length !== 1) return 'Introdu un singur număr.'
      if (nums[0] < -999 || nums[0] > 9999)
        return 'Valoarea trebuie să fie între -999 și 9999.'
      return null
    },
  },
]

export function LinearSearchVisualizer() {
  const [array, setArray] = useState(DEFAULT_ARRAY)
  const [target, setTarget] = useState(DEFAULT_TARGET)
  const frames = useMemo(
    () => generateLinearSearch({ array, target }),
    [array, target],
  )
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [array, target, reset])

  const { i, found, foundIndex, done, comparisons } = player.currentFrame.state
  const currentArray = player.currentFrame.state.array

  function handleLabSubmit(values: Record<string, string>) {
    const nums = parseIntegers(values.array ?? '')
    const tgt = parseIntegers(values.target ?? '')
    if (nums) setArray(nums)
    if (tgt && tgt.length === 1) setTarget(tgt[0])
  }

  return (
    <VisualizerShell
      title="Căutare liniară — O(n)"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-6 py-2">
        <div className="font-mono text-sm text-muted-foreground">
          Căutăm valoarea{' '}
          <span className="font-semibold text-foreground">{target}</span>
        </div>

        <div
          className="flex flex-wrap justify-center gap-2"
          role="list"
          aria-label="Vectorul"
        >
          {currentArray.map((value, idx) => {
            const isCurrent = idx === i
            const isMatch = found === true && idx === foundIndex
            const isChecked = i >= 0 ? idx < i : done

            let cellClass: string
            let stateLabel = ''
            if (isMatch) {
              cellClass = 'border-success bg-success/15 text-success'
              stateLabel = ', găsit'
            } else if (isCurrent) {
              cellClass = 'scale-110 border-primary bg-accent text-primary'
              stateLabel = ', se compară'
            } else if (isChecked) {
              cellClass = 'border-border bg-muted/40 text-muted-foreground'
              stateLabel = ', verificat'
            } else {
              cellClass = 'border-border bg-muted text-foreground'
            }

            return (
              <div
                key={idx}
                role="listitem"
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-[10px] border-2 font-mono text-base font-semibold transition-all duration-200',
                    cellClass,
                  )}
                  aria-current={isCurrent ? 'true' : undefined}
                  aria-label={`v[${idx}] = ${value}${stateLabel}`}
                >
                  {value}
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  [{idx}]
                </span>
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <StatChip label="comparații" value={comparisons} />
        </div>

        {done && (
          <div
            role="status"
            aria-live="polite"
            className={cn(
              'rounded-[10px] border px-4 py-3 text-center font-mono text-sm font-semibold',
              found
                ? 'border-success bg-success/15 text-success'
                : 'border-destructive bg-destructive/10 text-destructive',
            )}
          >
            {found
              ? `Găsit ${target} la indexul ${foundIndex} (${comparisons} comparații)`
              : `${target} nu există în vector (${comparisons} comparații)`}
          </div>
        )}
      </div>
    </VisualizerShell>
  )
}

interface StatChipProps {
  label: string
  value: number | string
}

function StatChip({ label, value }: StatChipProps) {
  return (
    <div className="flex min-w-[120px] flex-col items-center rounded-[10px] border border-border bg-muted/50 px-4 py-2">
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-xl font-bold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  )
}
