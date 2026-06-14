'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateSubmatrixSearch } from '@/lib/visualizers/generators/submatrix-search'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_GRID = [
  [1, 2, 3, 1, 2],
  [3, 1, 2, 3, 1],
  [1, 2, 3, 1, 2],
  [2, 3, 1, 2, 3],
]
const DEFAULT_PATTERN = [
  [1, 2],
  [3, 1],
]

/** Parsează linii separate prin ";", valori prin spațiu. Returnează null la eroare. */
function parseGrid(raw: string): number[][] | null {
  const rows = raw
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
  if (rows.length === 0) return null
  const grid: number[][] = []
  let width = -1
  for (const row of rows) {
    const nums = parseIntegers(row)
    if (!nums) return null
    if (width === -1) width = nums.length
    else if (nums.length !== width) return null
    grid.push(nums)
  }
  return grid
}

function makeGridField(
  id: string,
  label: string,
  placeholder: string,
  defaultValue: string,
  maxDim: number,
): LabField {
  return {
    id,
    label,
    placeholder,
    defaultValue,
    hint: `Linii separate prin ; · max ${maxDim}×${maxDim} · valori între -99 și 99`,
    validate: raw => {
      const g = parseGrid(raw)
      if (!g) return 'Linii cu același număr de întregi, separate prin ;.'
      if (g.length > maxDim || g[0].length > maxDim) return `Maximum ${maxDim}×${maxDim}.`
      if (g.some(row => row.some(n => n < -99 || n > 99)))
        return 'Valorile trebuie să fie între -99 și 99.'
      return null
    },
  }
}

const LAB_FIELDS: LabField[] = [
  makeGridField('grid', 'Grila', 'ex: 1 2 3 ; 3 1 2 ; 1 2 3', '1 2 3 1 2 ; 3 1 2 3 1 ; 1 2 3 1 2 ; 2 3 1 2 3', 6),
  makeGridField('pattern', 'Șablonul căutat', 'ex: 1 2 ; 3 1', '1 2 ; 3 1', 4),
]

function crossValidate(values: Record<string, string>): string | null {
  const g = parseGrid(values.grid ?? '')
  const p = parseGrid(values.pattern ?? '')
  if (!g || !p) return null
  if (p.length > g.length || p[0].length > g[0].length)
    return 'Șablonul nu încape în grilă.'
  return null
}

export function SubmatrixSearchVisualizer() {
  const [grid, setGrid] = useState<number[][]>(DEFAULT_GRID)
  const [pattern, setPattern] = useState<number[][]>(DEFAULT_PATTERN)

  const frames = useMemo(
    () => generateSubmatrixSearch({ grid, pattern }),
    [grid, pattern],
  )
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [grid, pattern, reset])

  const { anchor, cmp, phase, found } = player.currentFrame.state
  const currentGrid = player.currentFrame.state.grid as number[][]
  const currentPattern = player.currentFrame.state.pattern as number[][]
  const pr = currentPattern.length
  const pc = currentPattern[0].length

  function handleLabSubmit(values: Record<string, string>) {
    const g = parseGrid(values.grid ?? '')
    const p = parseGrid(values.pattern ?? '')
    if (!g || !p) return
    if (p.length > g.length || p[0].length > g[0].length) return
    setGrid(g)
    setPattern(p)
  }

  // (i,j) face parte dintr-o fereastră confirmată ca potrivire?
  function inFoundWindow(i: number, j: number): boolean {
    return found.some(
      f => i >= f.r && i < f.r + pr && j >= f.c && j < f.c + pc,
    )
  }

  const matchCount = found.length

  return (
    <VisualizerShell
      title="Căutarea unei submatrice — glisare brută a șablonului"
      player={player}
      frameCount={frames.length}
      labZone={
        <LabInput
          fields={LAB_FIELDS}
          onSubmit={handleLabSubmit}
          crossValidate={crossValidate}
        />
      }
    >
      <div className="flex flex-col items-center gap-6 py-2 sm:flex-row sm:items-start sm:justify-center sm:gap-10">
        {/* Grila */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">grilă</span>
          <div className="flex max-w-full flex-col gap-1 overflow-x-auto">
            {currentGrid.map((row, i) => (
              <div key={i} className="flex gap-1">
                {row.map((value, j) => {
                  const inWindow =
                    anchor !== null &&
                    i >= anchor.r &&
                    i < anchor.r + pr &&
                    j >= anchor.c &&
                    j < anchor.c + pc
                  const isCompared =
                    phase === 'compare' &&
                    anchor !== null &&
                    cmp !== null &&
                    i === anchor.r + cmp.dr &&
                    j === anchor.c + cmp.dc
                  const comparedEqual =
                    isCompared &&
                    anchor !== null &&
                    cmp !== null &&
                    value === currentPattern[cmp.dr][cmp.dc]
                  const isFound = inFoundWindow(i, j)
                  return (
                    <div
                      key={j}
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-[6px] border-2 font-mono text-xs font-semibold tabular-nums transition-all duration-200',
                        isCompared
                          ? comparedEqual
                            ? 'scale-110 border-success bg-success/15 text-success'
                            : 'scale-110 border-destructive bg-destructive/15 text-destructive'
                          : isFound
                            ? 'border-success bg-success/20 text-success'
                            : inWindow
                              ? 'border-primary bg-accent text-primary'
                              : 'border-border bg-muted text-foreground',
                      )}
                      aria-label={`m[${i}][${j}] = ${value}${isFound ? ', în potrivire' : ''}`}
                    >
                      {value}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Șablonul */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">șablon</span>
          <div className="flex flex-col gap-1">
            {currentPattern.map((row, dr) => (
              <div key={dr} className="flex gap-1">
                {row.map((value, dc) => {
                  const isCompared =
                    phase === 'compare' &&
                    cmp !== null &&
                    cmp.dr === dr &&
                    cmp.dc === dc
                  return (
                    <div
                      key={dc}
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-[6px] border-2 font-mono text-xs font-semibold tabular-nums transition-all duration-200',
                        isCompared
                          ? 'scale-110 border-primary bg-accent text-primary'
                          : 'border-border bg-muted/60 text-foreground',
                      )}
                      aria-label={`șablon[${dr}][${dc}] = ${value}`}
                    >
                      {value}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rezultat */}
      <div className="mt-4 flex justify-center">
        <div
          className={cn(
            'flex items-center gap-2 rounded-[10px] border px-4 py-2',
            matchCount > 0
              ? 'border-success/40 bg-success/10'
              : 'border-border bg-muted/50',
          )}
        >
          <span className="font-mono text-xs text-muted-foreground">
            potriviri găsite
          </span>
          <span
            className={cn(
              'font-mono text-xl font-bold tabular-nums',
              matchCount > 0 ? 'text-success' : 'text-foreground',
            )}
          >
            {matchCount}
          </span>
          {found.length > 0 && (
            <span className="font-mono text-xs text-muted-foreground">
              la {found.map(f => `(${f.r},${f.c})`).join(', ')}
            </span>
          )}
        </div>
      </div>
    </VisualizerShell>
  )
}
