'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateMatrixTranspose } from '@/lib/visualizers/generators/matrix-transpose'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_GRID = [
  [1, 2, 3],
  [4, 5, 6],
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
    placeholder: 'ex: 1 2 3 ; 4 5 6',
    defaultValue: '1 2 3 ; 4 5 6',
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

export function MatrixTransposeVisualizer() {
  const [grid, setGrid] = useState<number[][]>(DEFAULT_GRID)

  const frames = useMemo(() => generateMatrixTranspose({ grid }), [grid])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [grid, reset])

  const { src, dst, done } = player.currentFrame.state
  const sourceGrid = player.currentFrame.state.grid
  const transposed = player.currentFrame.state.transposed

  function handleLabSubmit(values: Record<string, string>) {
    const g = parseGrid(values.grid ?? '')
    if (!g) return
    if (g.length > 6 || g[0].length > 6) return
    if (g.some(row => row.some(n => n < -99 || n > 99))) return
    setGrid(g)
  }

  /** Has source cell (i,j) already been copied (in reading order, before/at src)? */
  function isSourceCopied(i: number, j: number): boolean {
    const cols = sourceGrid[0].length
    if (src === null) return done
    const srcIndex = src.r * cols + src.c
    const thisIndex = i * cols + j
    return thisIndex <= srcIndex
  }

  return (
    <VisualizerShell
      title="Transpunerea unei matrice — t[j][i] = m[i][j]"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-6 py-2 sm:flex-row sm:items-start sm:justify-center sm:gap-10">
        {/* Source matrix */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            sursă (m)
          </span>
          <div className="flex max-w-full flex-col gap-1 overflow-x-auto">
            {sourceGrid.map((row, i) => (
              <div key={i} className="flex gap-1">
                {row.map((value, j) => {
                  const isCurrent = src !== null && src.r === i && src.c === j
                  const copied = !isCurrent && isSourceCopied(i, j)
                  return (
                    <div
                      key={j}
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-[6px] border-2 font-mono text-xs font-semibold tabular-nums transition-all duration-200',
                        isCurrent
                          ? 'scale-110 border-primary bg-accent text-primary'
                          : copied
                            ? 'border-success bg-success/15 text-success'
                            : 'border-border bg-muted text-foreground',
                      )}
                      aria-label={`m[${i}][${j}] = ${value}`}
                    >
                      {value}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Transposed matrix */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            transpusă (t)
          </span>
          <div className="flex max-w-full flex-col gap-1 overflow-x-auto">
            {transposed.map((row, i) => (
              <div key={i} className="flex gap-1">
                {row.map((cell, j) => {
                  const isCurrent = dst !== null && dst.r === i && dst.c === j
                  return (
                    <div
                      key={j}
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-[6px] border-2 font-mono text-xs font-semibold tabular-nums transition-all duration-200',
                        isCurrent
                          ? 'scale-110 border-primary bg-accent text-primary'
                          : cell.filled
                            ? 'border-success bg-success/15 text-success'
                            : 'border-dashed border-border bg-background text-muted-foreground',
                      )}
                      aria-label={
                        cell.filled
                          ? `t[${i}][${j}] = ${cell.value}`
                          : `t[${i}][${j}] gol`
                      }
                    >
                      {cell.filled ? cell.value : ''}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </VisualizerShell>
  )
}
