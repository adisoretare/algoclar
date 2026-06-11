'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateSorting } from '@/lib/visualizers/generators/sorting'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_ARRAY = [6, 3, 8, 1, 9, 2, 7, 4]

const LAB_FIELDS: LabField[] = [
  {
    id: 'array',
    label: 'Vectorul tău',
    placeholder: 'ex: 6 3 8 1 9 2',
    hint: 'Numere întregi separate prin spațiu · min 2 · max 12 valori · între 1 și 99',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums) return 'Introdu numere întregi separate prin spațiu.'
      if (nums.length < 2) return 'Introdu cel puțin 2 valori.'
      if (nums.length > 12) return 'Maximum 12 valori (pentru lizibilitate).'
      if (nums.some(n => n < 1 || n > 99))
        return 'Valorile trebuie să fie între 1 și 99.'
      return null
    },
  },
]

function shuffleArray(arr: number[]): number[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function SortingVisualizer() {
  const [algorithm, setAlgorithm] = useState<'bubble' | 'selection'>('bubble')
  const [array, setArray] = useState(DEFAULT_ARRAY)

  const frames = useMemo(
    () => generateSorting({ array, algorithm }),
    [array, algorithm],
  )
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [array, algorithm, reset])

  function handleShuffle() {
    setArray(prev => shuffleArray(prev))
  }

  function handleLabSubmit(values: Record<string, string>) {
    const nums = parseIntegers(values.array ?? '')
    if (nums) setArray(nums)
  }

  const { array: currentArray, comparing, swapping, sorted, done } =
    player.currentFrame.state

  const max = Math.max(...currentArray)

  return (
    <div className="flex flex-col gap-3">
      {/* Algorithm selector + shuffle */}
      <div className="flex items-center gap-3">
        <select
          value={algorithm}
          onChange={e => setAlgorithm(e.target.value as 'bubble' | 'selection')}
          className="rounded-[8px] border border-border bg-muted px-3 py-1.5 font-mono text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="bubble">Bubble Sort</option>
          <option value="selection">Selection Sort</option>
        </select>
        <button
          type="button"
          onClick={handleShuffle}
          className="rounded-[8px] border border-border bg-muted px-3 py-1.5 font-mono text-sm text-foreground transition-colors hover:bg-muted/70"
        >
          Amestecă
        </button>
      </div>

      <VisualizerShell
        title={`${algorithm === 'bubble' ? 'Bubble Sort' : 'Selection Sort'} — sortare vizualizată`}
        player={player}
        frameCount={frames.length}
        labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
      >
        <div className="px-2">
          {/* Bar chart — columns stretch to h-40; bar area wrapper gives definite height for % resolution */}
          <div className="flex h-40 w-full gap-1">
            {currentArray.map((value, i) => {
              const isComparing =
                comparing !== null &&
                (i === comparing[0] || i === comparing[1])
              const isSorted = sorted.includes(i) || done

              const barClass = isSorted
                ? 'bg-success'
                : isComparing
                  ? swapping
                    ? 'bg-destructive'
                    : 'bg-warning'
                  : 'bg-primary'

              return (
                <div
                  key={i}
                  className="flex flex-1 flex-col items-center gap-0.5"
                >
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className={cn(
                        'w-full rounded-t-[4px] transition-colors duration-200',
                        barClass,
                      )}
                      style={{ height: `${(value / max) * 100}%` }}
                      aria-label={`v[${i}] = ${value}`}
                    />
                  </div>
                  {currentArray.length <= 8 && (
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {value}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </VisualizerShell>
    </div>
  )
}
