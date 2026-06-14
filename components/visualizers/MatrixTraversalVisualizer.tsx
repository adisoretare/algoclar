'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateMatrixTraversal } from '@/lib/visualizers/generators/matrix-traversal'
import type { MatrixTraversalMode } from '@/lib/visualizers/generators/matrix-traversal'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_GRID = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
]

const MODES: { id: MatrixTraversalMode; label: string }[] = [
  { id: 'linii', label: 'linii' },
  { id: 'coloane', label: 'coloane' },
  { id: 'diagonale', label: 'diagonale' },
  { id: 'spirala', label: 'spirală' },
]

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
    label: 'Matricea ta (linii separate prin ;)',
    placeholder: 'ex: 1 2 3 4 ; 5 6 7 8 ; 9 10 11 12',
    defaultValue: '1 2 3 4 ; 5 6 7 8 ; 9 10 11 12',
    hint: 'Fiecare linie cu același număr de valori · max 6×6 · valori între -99 și 99',
    validate: raw => {
      const grid = parseGrid(raw)
      if (!grid) return 'Linii cu același număr de întregi, separate prin ;.'
      if (grid.length > 6 || grid[0].length > 6) return 'Maximum 6×6.'
      if (grid.some(row => row.some(n => n < -99 || n > 99)))
        return 'Valorile trebuie să fie între -99 și 99.'
      return null
    },
  },
]

interface MatrixTraversalVisualizerProps {
  initialMode?: MatrixTraversalMode
}

export function MatrixTraversalVisualizer({
  initialMode = 'linii',
}: MatrixTraversalVisualizerProps) {
  const [grid, setGrid] = useState<number[][]>(DEFAULT_GRID)
  const [mode, setMode] = useState<MatrixTraversalMode>(initialMode)

  const frames = useMemo(
    () => generateMatrixTraversal({ grid, mode }),
    [grid, mode],
  )
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [grid, mode, reset])

  const { current, visited, output, done } = player.currentFrame.state
  const currentGrid = player.currentFrame.state.grid

  // Index of the most recent visit per cell, for trail rendering.
  const visitedKeys = useMemo(() => {
    const set = new Set<string>()
    for (const cell of visited) set.add(`${cell.r}:${cell.c}`)
    return set
  }, [visited])

  function handleLabSubmit(values: Record<string, string>) {
    const g = parseGrid(values.grid ?? '')
    if (!g) return
    if (g.length > 6 || g[0].length > 6) return
    if (g.some(row => row.some(n => n < -99 || n > 99))) return
    setGrid(g)
  }

  return (
    <VisualizerShell
      title="Parcurgeri de matrice — linii, coloane, diagonale, spirală"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-5 py-2">
        {/* Mode tabs */}
        <div
          className="flex flex-wrap justify-center gap-2"
          role="tablist"
          aria-label="Mod de parcurgere"
        >
          {MODES.map(m => {
            const active = m.id === mode
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMode(m.id)}
                className={cn(
                  'rounded-[8px] border px-3 py-1.5 font-mono text-xs font-semibold transition-colors',
                  active
                    ? 'border-primary bg-accent text-primary'
                    : 'border-border bg-muted text-muted-foreground hover:text-foreground',
                )}
              >
                {m.label}
              </button>
            )
          })}
        </div>

        {/* Grid */}
        <div
          className="flex flex-col gap-1"
          role="grid"
          aria-label="Matricea parcursă"
        >
          {currentGrid.map((row, i) => (
            <div key={i} role="row" className="flex gap-1">
              {row.map((value, j) => {
                const isCurrent = current?.r === i && current?.c === j
                const isVisited = visitedKeys.has(`${i}:${j}`)
                const stateLabel = isCurrent
                  ? ', vizitat acum'
                  : isVisited
                    ? ', vizitat'
                    : ''
                return (
                  <div
                    key={j}
                    role="gridcell"
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-[6px] border-2 font-mono text-xs font-semibold tabular-nums transition-all duration-200',
                      isCurrent
                        ? 'scale-110 border-primary bg-accent text-primary'
                        : isVisited
                          ? 'border-success bg-success/15 text-success'
                          : 'border-border bg-muted text-foreground',
                    )}
                    aria-current={isCurrent ? 'true' : undefined}
                    aria-label={`m[${i}][${j}] = ${value}${stateLabel}`}
                  >
                    {value}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Output sequence */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            secvența de ieșire
          </span>
          <div
            className="flex min-h-[2rem] flex-wrap justify-center gap-1.5"
            role="list"
            aria-label="Secvența vizitată"
          >
            {output.length === 0 ? (
              <span className="font-mono text-xs text-muted-foreground/60">
                —
              </span>
            ) : (
              output.map((value, i) => (
                <span
                  key={i}
                  role="listitem"
                  aria-label={`poziția ${i + 1}: ${value}`}
                  className={cn(
                    'flex h-7 min-w-[1.75rem] items-center justify-center rounded-[6px] border px-1.5 font-mono text-xs font-semibold tabular-nums',
                    done && i === output.length - 1
                      ? 'border-success bg-success/15 text-success'
                      : i === output.length - 1
                        ? 'border-primary bg-accent text-primary'
                        : 'border-border bg-muted text-foreground',
                  )}
                >
                  {value}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </VisualizerShell>
  )
}

export function MatrixTraversalLinii() {
  return <MatrixTraversalVisualizer initialMode="linii" />
}

export function MatrixTraversalColoane() {
  return <MatrixTraversalVisualizer initialMode="coloane" />
}

export function MatrixTraversalDiagonale() {
  return <MatrixTraversalVisualizer initialMode="diagonale" />
}

export function MatrixTraversalSpirala() {
  return <MatrixTraversalVisualizer initialMode="spirala" />
}
