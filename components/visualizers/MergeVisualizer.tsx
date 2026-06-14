'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateMergeTwo } from '@/lib/visualizers/generators/merge-two'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_A = [1, 4, 5, 8]
const DEFAULT_B = [2, 3, 6, 7]

function validateSortedField(label: string) {
  return (raw: string): string | null => {
    const nums = parseIntegers(raw)
    if (!nums) return 'Introdu numere întregi separate prin spațiu.'
    if (nums.length < 1) return `Introdu cel puțin 1 valoare în ${label}.`
    if (nums.length > 12) return 'Maximum 12 valori.'
    for (let k = 1; k < nums.length; k++) {
      if (nums[k] < nums[k - 1])
        return `Vectorul ${label} trebuie să fie sortat crescător.`
    }
    return null
  }
}

const LAB_FIELDS: LabField[] = [
  {
    id: 'a',
    label: 'Vectorul A (sortat crescător)',
    placeholder: 'ex: 1 4 5 8',
    defaultValue: '1 4 5 8',
    hint: 'Numere întregi separate prin spațiu · sortate crescător · 1..12 valori',
    validate: validateSortedField('A'),
  },
  {
    id: 'b',
    label: 'Vectorul B (sortat crescător)',
    placeholder: 'ex: 2 3 6 7',
    defaultValue: '2 3 6 7',
    hint: 'Numere întregi separate prin spațiu · sortate crescător · 1..12 valori',
    validate: validateSortedField('B'),
  },
]

function crossValidateTotal(values: Record<string, string>): string | null {
  const a = parseIntegers(values.a ?? '')
  const b = parseIntegers(values.b ?? '')
  if (!a || !b) return null
  if (a.length + b.length > 24)
    return 'Cei doi vectori au împreună prea multe valori (maximum 24).'
  return null
}

export function MergeVisualizer() {
  const [a, setA] = useState(DEFAULT_A)
  const [b, setB] = useState(DEFAULT_B)

  const frames = useMemo(() => generateMergeTwo({ a, b }), [a, b])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [a, b, reset])

  const { i, j, result, taken, done } = player.currentFrame.state
  const lastTakenIndex = result.length - 1

  function handleLabSubmit(values: Record<string, string>) {
    const na = parseIntegers(values.a ?? '')
    const nb = parseIntegers(values.b ?? '')
    if (!na || !nb) return
    setA(na)
    setB(nb)
  }

  return (
    <VisualizerShell
      title="Interclasarea a doi vectori sortați — O(n+m)"
      player={player}
      frameCount={frames.length}
      labZone={
        <LabInput
          fields={LAB_FIELDS}
          onSubmit={handleLabSubmit}
          crossValidate={crossValidateTotal}
        />
      }
    >
      <div className="flex flex-col items-center gap-6 py-2">
        {/* Array A */}
        <ArrayRow
          name="A"
          values={a}
          pointer={i}
          taken={taken === 'a'}
          done={done}
        />

        {/* Array B */}
        <ArrayRow
          name="B"
          values={b}
          pointer={j}
          taken={taken === 'b'}
          done={done}
        />

        {/* Result row */}
        <div className="flex w-full flex-col items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            Rezultat (interclasat)
          </span>
          <div
            className="flex min-h-[44px] flex-wrap items-center justify-center gap-1.5"
            role="list"
            aria-label="Vectorul rezultat"
          >
            {result.length === 0 ? (
              <span className="font-mono text-xs text-muted-foreground/60">
                (gol)
              </span>
            ) : (
              result.map((value, k) => {
                const isLast = k === lastTakenIndex && !done
                return (
                  <div
                    key={k}
                    role="listitem"
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-[8px] border-2 font-mono text-sm font-semibold tabular-nums transition-all duration-200',
                      isLast
                        ? 'scale-110 border-success bg-success/15 text-success'
                        : 'border-success bg-success/5 text-foreground',
                    )}
                    aria-label={`rezultat[${k}] = ${value}`}
                  >
                    {value}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </VisualizerShell>
  )
}

interface ArrayRowProps {
  name: string
  values: number[]
  pointer: number
  taken: boolean
  done: boolean
}

function ArrayRow({ name, values, pointer, taken, done }: ArrayRowProps) {
  // The cell just consumed (flash) is the one immediately before the pointer
  // when this side was the one taken in the current step.
  const lastTakenIndex = taken ? pointer - 1 : -1
  const pointerLabel = name === 'A' ? 'i' : 'j'

  return (
    <div className="flex w-full flex-col items-center gap-1">
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-xs font-semibold text-muted-foreground">
          {name}
        </span>
        <div className="flex flex-wrap justify-center gap-1.5" role="list" aria-label={`Vectorul ${name}`}>
          {values.map((value, k) => {
            const isPointer = k === pointer && !done
            const isConsumed = k < pointer
            const isFlash = k === lastTakenIndex
            return (
              <div key={k} role="listitem" className="flex flex-col items-center gap-1">
                <div className="flex h-4 items-end">
                  {isPointer && (
                    <span className="font-mono text-[10px] font-bold text-primary">
                      {pointerLabel}
                    </span>
                  )}
                </div>
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-[8px] border-2 font-mono text-base font-semibold tabular-nums transition-all duration-200',
                    isFlash
                      ? 'scale-110 border-success bg-success/15 text-success'
                      : isPointer
                        ? 'scale-105 border-primary bg-accent text-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]'
                        : isConsumed
                          ? 'border-border bg-muted/40 text-muted-foreground'
                          : 'border-border bg-muted text-foreground',
                  )}
                  aria-label={`${name}[${k}] = ${value}${isPointer ? `, pointer ${pointerLabel}` : ''}${isConsumed ? ', consumat' : ''}`}
                >
                  {value}
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  [{k}]
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
