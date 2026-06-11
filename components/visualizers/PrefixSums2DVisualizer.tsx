'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generatePrefixSums2D } from '@/lib/visualizers/generators/prefix-sums-2d'
import type { Rect } from '@/lib/visualizers/generators/prefix-sums-2d'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_GRID = [
  [3, 1, 4, 2],
  [1, 5, 2, 6],
  [2, 3, 1, 0],
  [4, 2, 7, 1],
]
const DEFAULT_QUERY: Rect = { r1: 1, c1: 1, r2: 2, c2: 3 }

/** Parses rows separated by ";", values by whitespace. Returns null on error. */
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

const LAB_FIELDS: LabField[] = [
  {
    id: 'grid',
    label: 'Grila ta (linii separate prin ;)',
    placeholder: 'ex: 3 1 4 ; 1 5 2 ; 2 3 1',
    hint: 'Fiecare linie cu același număr de valori · max 5×5 · valori între -99 și 99',
    validate: raw => {
      const grid = parseGrid(raw)
      if (!grid) return 'Linii cu același număr de întregi, separate prin ;.'
      if (grid.length > 5 || grid[0].length > 5) return 'Maximum 5×5.'
      if (grid.some(row => row.some(n => n < -99 || n > 99)))
        return 'Valorile trebuie să fie între -99 și 99.'
      return null
    },
  },
  {
    id: 'query',
    label: 'Dreptunghiul: r1 c1 r2 c2 (0-indexat)',
    placeholder: 'ex: 1 1 2 3',
    hint: 'Patru numere: colț stânga-sus și colț dreapta-jos',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums || nums.length !== 4) return 'Introdu exact 4 numere.'
      const [r1, c1, r2, c2] = nums
      if (r1 < 0 || c1 < 0 || r1 > r2 || c1 > c2) return 'Trebuie r1≤r2 și c1≤c2.'
      return null
    },
  },
]

export function PrefixSums2DVisualizer() {
  const [grid, setGrid] = useState<number[][]>(DEFAULT_GRID)
  const [query, setQuery] = useState<Rect>(DEFAULT_QUERY)

  const frames = useMemo(
    () => generatePrefixSums2D({ grid, query }),
    [grid, query],
  )
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [grid, query, reset])

  const {
    prefix,
    phase,
    buildR,
    buildC,
    query: q,
    queryStage,
    result,
  } = player.currentFrame.state
  const currentGrid = player.currentFrame.state.grid

  function handleLabSubmit(values: Record<string, string>) {
    const g = parseGrid(values.grid ?? '')
    const nums = parseIntegers(values.query ?? '')
    if (!g || !nums || nums.length !== 4) return
    const [r1, c1, r2, c2] = nums
    if (r1 < 0 || c1 < 0 || r1 > r2 || c1 > c2) return
    if (r2 >= g.length || c2 >= g[0].length) return
    setGrid(g)
    setQuery({ r1, c1, r2, c2 })
  }

  const inQuery = phase === 'query' || phase === 'done'

  // Which prefix corner is highlighted at the current query stage, and how.
  function cornerKind(i: number, j: number): 'add' | 'sub' | null {
    if (!inQuery) return null
    if (queryStage >= 1 && i === q.r2 + 1 && j === q.c2 + 1) return 'add'
    if (queryStage >= 2 && i === q.r1 && j === q.c2 + 1) return 'sub'
    if (queryStage >= 3 && i === q.r2 + 1 && j === q.c1) return 'sub'
    if (queryStage >= 4 && i === q.r1 && j === q.c1) return 'add'
    return null
  }

  return (
    <VisualizerShell
      title="Sume parțiale 2D — sumă pe dreptunghi în O(1)"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-6 py-2 sm:flex-row sm:items-start sm:justify-center sm:gap-10">
        {/* Grid */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">grilă</span>
          <div className="flex flex-col gap-1">
            {currentGrid.map((row, i) => (
              <div key={i} className="flex gap-1">
                {row.map((value, j) => {
                  const buildingThis =
                    phase === 'build' && buildR - 1 === i && buildC - 1 === j
                  const inRect =
                    inQuery &&
                    i >= q.r1 &&
                    i <= q.r2 &&
                    j >= q.c1 &&
                    j <= q.c2
                  return (
                    <div
                      key={j}
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-[6px] border-2 font-mono text-xs font-semibold tabular-nums transition-all duration-200',
                        buildingThis
                          ? 'scale-110 border-primary bg-accent text-primary'
                          : inRect
                            ? 'border-success bg-success/15 text-success'
                            : 'border-border bg-muted text-foreground',
                      )}
                      aria-label={`g[${i}][${j}] = ${value}`}
                    >
                      {value}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Prefix table (rows+1 x cols+1) */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            prefix (santinele pe rândul/coloana 0)
          </span>
          <div className="flex flex-col gap-1">
            {prefix.map((row, i) => (
              <div key={i} className="flex gap-1">
                {row.map((value, j) => {
                  const buildingThis =
                    phase === 'build' && buildR === i && buildC === j
                  const kind = cornerKind(i, j)
                  const isSentinel = i === 0 || j === 0
                  return (
                    <div
                      key={j}
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-[6px] border-2 font-mono text-xs font-semibold tabular-nums transition-all duration-200',
                        buildingThis
                          ? 'scale-110 border-primary bg-accent text-primary'
                          : kind === 'add'
                            ? 'border-success bg-success/20 text-success'
                            : kind === 'sub'
                              ? 'border-destructive bg-destructive/15 text-destructive'
                              : isSentinel
                                ? 'border-border bg-muted/40 text-muted-foreground'
                                : 'border-border bg-muted text-foreground',
                      )}
                      aria-label={`prefix[${i}][${j}] = ${value}`}
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

      {/* Result */}
      {inQuery && queryStage >= 4 && result !== null && (
        <div className="mt-4 flex justify-center">
          <div className="flex items-center gap-2 rounded-[10px] border border-success/40 bg-success/10 px-4 py-2">
            <span className="font-mono text-xs text-muted-foreground">
              sumă dreptunghi =
            </span>
            <span className="font-mono text-xl font-bold tabular-nums text-success">
              {result}
            </span>
          </div>
        </div>
      )}
    </VisualizerShell>
  )
}
