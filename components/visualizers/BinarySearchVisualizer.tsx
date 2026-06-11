'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateBinarySearch } from '@/lib/visualizers/generators/binary-search'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_ARRAY = [2, 5, 8, 12, 16, 23, 38, 45]
const DEFAULT_TARGET = 23

const LAB_FIELDS: LabField[] = [
  {
    id: 'array',
    label: 'Vectorul tău (va fi sortat automat)',
    placeholder: 'ex: 2 5 8 12 16 23',
    hint: 'Numere întregi separate prin spațiu · min 2 · max 15 valori · între -9999 și 9999',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums) return 'Introdu numere întregi separate prin spațiu.'
      if (nums.length < 2) return 'Introdu cel puțin 2 valori.'
      if (nums.length > 15) return 'Maximum 15 valori.'
      if (nums.some(n => n < -9999 || n > 9999))
        return 'Valorile trebuie să fie între -9999 și 9999.'
      return null
    },
  },
]

interface BinarySearchVisualizerProps {
  ambient?: boolean
}

export function BinarySearchVisualizer({
  ambient = false,
}: BinarySearchVisualizerProps) {
  const [labArray, setLabArray] = useState(DEFAULT_ARRAY)
  const [target, setTarget] = useState(DEFAULT_TARGET)
  const [targetInput, setTargetInput] = useState(String(DEFAULT_TARGET))

  const frames = useMemo(
    () => generateBinarySearch({ array: labArray, target }),
    [labArray, target],
  )
  const player = useStepPlayer(frames, { loop: ambient })
  const { reset } = player

  useEffect(() => {
    reset()
  }, [labArray, target, reset])

  // Auto-play for ambient hero use
  useEffect(() => {
    if (ambient) player.play()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ambient])

  function handleTargetChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    setTargetInput(raw)
    const n = parseInt(raw.trim(), 10)
    if (!isNaN(n)) setTarget(n)
  }

  function handleLabSubmit(values: Record<string, string>) {
    const nums = parseIntegers(values.array ?? '')
    if (nums) {
      const sorted = [...nums].sort((a, b) => a - b)
      setLabArray(sorted)
    }
  }

  const { array, st, dr, mid, eliminated, found, notFound, foundIndex } =
    player.currentFrame.state

  return (
    <div className="flex flex-col gap-3">
      {!ambient && (
        <div className="flex items-center gap-3">
          <label className="font-mono text-sm text-muted-foreground" htmlFor="bs-target">
            Caută numărul:
          </label>
          <input
            id="bs-target"
            type="number"
            value={targetInput}
            onChange={handleTargetChange}
            className="w-24 rounded-[8px] border border-border bg-muted px-3 py-1.5 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      <VisualizerShell
        title="Căutare binară"
        player={player}
        frameCount={frames.length}
        ambient={ambient}
        labZone={
          !ambient ? (
            <LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />
          ) : undefined
        }
      >
        <div className="flex flex-col items-center gap-3 py-2">
          {/* Array cells with markers */}
          <div className="flex flex-wrap justify-center gap-2">
            {array.map((value, i) => {
              const isFound = foundIndex !== null && i === foundIndex
              const isEliminated = eliminated[i]
              const isMid = i === mid && !notFound

              const cellClass = isFound
                ? 'border-success bg-success/10 text-success scale-110 shadow-[0_0_0_4px_hsl(var(--success)/0.15)]'
                : isEliminated
                  ? 'opacity-30 border-border bg-muted text-muted-foreground'
                  : isMid
                    ? 'border-primary bg-primary text-primary-foreground scale-110'
                    : 'border-border bg-muted text-foreground'

              const markers: string[] = []
              if (!notFound) {
                if (i === st) markers.push('st')
                if (i === mid) markers.push('mid')
                if (i === dr) markers.push('dr')
              }

              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-0.5"
                >
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-[10px] border-2 font-mono text-base font-semibold transition-all duration-200',
                      cellClass,
                    )}
                    aria-label={`v[${i}] = ${value}${isFound ? ', găsit' : ''}${isEliminated ? ', eliminat' : ''}${isMid ? ', mid' : ''}`}
                  >
                    {value}
                  </div>
                  <div className="flex h-4 w-12 flex-col items-center justify-start">
                    {markers.map(m => (
                      <span
                        key={m}
                        className="font-mono text-[10px] leading-tight text-muted-foreground"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Status chip */}
          {(found || notFound) && (
            <div
              className={cn(
                'rounded-full px-4 py-1.5 font-mono text-xs font-semibold',
                found
                  ? 'bg-success/10 text-success'
                  : 'bg-destructive/10 text-destructive',
              )}
            >
              {found
                ? `Găsit la indexul ${foundIndex}!`
                : `${target} nu există în vector.`}
            </div>
          )}
        </div>
      </VisualizerShell>
    </div>
  )
}
