'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generatePrefixExtrema } from '@/lib/visualizers/generators/prefix-extrema'
import type {
  PrefixExtremaDirection,
  PrefixExtremaKind,
} from '@/lib/visualizers/generators/prefix-extrema'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_ARRAY = [3, 1, 4, 1, 5, 9, 2, 6]

const DIRECTIONS: { id: PrefixExtremaDirection; label: string }[] = [
  { id: 'prefix', label: 'prefix' },
  { id: 'sufix', label: 'sufix' },
]

const KINDS: { id: PrefixExtremaKind; label: string }[] = [
  { id: 'max', label: 'maxim' },
  { id: 'min', label: 'minim' },
]

const LAB_FIELDS: LabField[] = [
  {
    id: 'array',
    label: 'Vectorul tău',
    placeholder: 'ex: 3 1 4 1 5 9 2 6',
    defaultValue: '3 1 4 1 5 9 2 6',
    hint: 'Numere întregi separate prin spațiu · min 1 · max 15 valori · între -999 și 999',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums) return 'Introdu numere întregi separate prin spațiu.'
      if (nums.length < 1) return 'Introdu cel puțin 1 valoare.'
      if (nums.length > 15) return 'Maximum 15 valori.'
      if (nums.some(n => n < -999 || n > 999))
        return 'Valorile trebuie să fie între -999 și 999.'
      return null
    },
  },
]

interface PrefixExtremaVisualizerProps {
  initialDirection?: PrefixExtremaDirection
  initialKind?: PrefixExtremaKind
}

export function PrefixExtremaVisualizer({
  initialDirection = 'prefix',
  initialKind = 'max',
}: PrefixExtremaVisualizerProps) {
  const [array, setArray] = useState<number[]>(DEFAULT_ARRAY)
  const [direction, setDirection] =
    useState<PrefixExtremaDirection>(initialDirection)
  const [kind, setKind] = useState<PrefixExtremaKind>(initialKind)

  const frames = useMemo(
    () => generatePrefixExtrema({ array, direction, kind }),
    [array, direction, kind],
  )
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [array, direction, kind, reset])

  const { result, filled, currentIndex, sourceIndex, done } =
    player.currentFrame.state
  const currentArray = player.currentFrame.state.array
  const letter = direction === 'prefix' ? 'P' : 'S'

  function handleLabSubmit(values: Record<string, string>) {
    const nums = parseIntegers(values.array ?? '')
    if (!nums) return
    if (nums.length < 1 || nums.length > 15) return
    if (nums.some(n => n < -999 || n > 999)) return
    setArray(nums)
  }

  return (
    <VisualizerShell
      title="Maxime și minime pe prefixe și sufixe"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-5 py-2">
        {/* Direction tabs */}
        <div
          className="flex flex-wrap justify-center gap-2"
          role="tablist"
          aria-label="Direcție"
        >
          {DIRECTIONS.map(d => {
            const active = d.id === direction
            return (
              <button
                key={d.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setDirection(d.id)}
                className={cn(
                  'rounded-[8px] border px-3 py-1.5 font-mono text-xs font-semibold transition-colors',
                  active
                    ? 'border-primary bg-accent text-primary'
                    : 'border-border bg-muted text-muted-foreground hover:text-foreground',
                )}
              >
                {d.label}
              </button>
            )
          })}
        </div>

        {/* Kind tabs */}
        <div
          className="flex flex-wrap justify-center gap-2"
          role="tablist"
          aria-label="Tip extremă"
        >
          {KINDS.map(k => {
            const active = k.id === kind
            return (
              <button
                key={k.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setKind(k.id)}
                className={cn(
                  'rounded-[8px] border px-3 py-1.5 font-mono text-xs font-semibold transition-colors',
                  active
                    ? 'border-primary bg-accent text-primary'
                    : 'border-border bg-muted text-muted-foreground hover:text-foreground',
                )}
              >
                {k.label}
              </button>
            )
          })}
        </div>

        {/* Array row */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">vector a</span>
          <div
            className="flex flex-wrap justify-center gap-2"
            role="list"
            aria-label="Vectorul"
          >
            {currentArray.map((value, i) => {
              const isCurrent = i === currentIndex
              return (
                <div
                  key={i}
                  role="listitem"
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-[8px] border-2 font-mono text-sm font-semibold tabular-nums transition-all duration-200',
                      isCurrent
                        ? 'scale-110 border-primary bg-accent text-primary'
                        : 'border-border bg-muted text-foreground',
                    )}
                    aria-current={isCurrent ? 'true' : undefined}
                    aria-label={`a[${i}] = ${value}${isCurrent ? ', element curent' : ''}`}
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

        {/* Result (extrema) row */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            extrema {letter}
          </span>
          <div
            className="flex flex-wrap justify-center gap-2"
            role="list"
            aria-label={`Vectorul de extreme ${letter}`}
          >
            {currentArray.map((_, i) => {
              const isFilled = filled[i]
              const isCurrent = i === currentIndex
              const isSource = i === sourceIndex
              return (
                <div
                  key={i}
                  role="listitem"
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-[8px] border-2 font-mono text-sm font-semibold tabular-nums transition-all duration-200',
                      isCurrent
                        ? 'scale-110 border-primary bg-accent text-primary'
                        : isSource
                          ? 'border-success bg-success/15 text-success'
                          : isFilled
                            ? 'border-border bg-muted text-foreground'
                            : 'border-dashed border-border text-muted-foreground',
                    )}
                    aria-current={isCurrent ? 'true' : undefined}
                    aria-label={
                      isFilled
                        ? `${letter}[${i}] = ${result[i]}${isCurrent ? ', tocmai calculat' : isSource ? ', extrema sursă' : ''}`
                        : `${letter}[${i}] încă necalculat`
                    }
                  >
                    {isFilled ? result[i] : '·'}
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    [{i}]
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {done && (
          <span className="font-mono text-xs text-success">
            Gata — toate extremele {letter} sunt calculate.
          </span>
        )}
      </div>
    </VisualizerShell>
  )
}

export function PrefixMaxVisualizer() {
  return <PrefixExtremaVisualizer initialDirection="prefix" initialKind="max" />
}

export function SuffixMaxVisualizer() {
  return <PrefixExtremaVisualizer initialDirection="sufix" initialKind="max" />
}
