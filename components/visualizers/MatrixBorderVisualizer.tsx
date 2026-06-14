'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateMatrixBorder } from '@/lib/visualizers/generators/matrix-border'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_GRID = [
  [1, 2],
  [3, 4],
]
const DEFAULT_FILL = 0

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
    placeholder: 'ex: 1 2 ; 3 4',
    defaultValue: '1 2 ; 3 4',
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
  {
    id: 'fill',
    label: 'Valoarea santinelei (chenarului)',
    placeholder: 'ex: 0',
    defaultValue: '0',
    hint: 'Un singur întreg, între -99 și 99',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums || nums.length !== 1) return 'Introdu exact un întreg.'
      if (nums[0] < -99 || nums[0] > 99)
        return 'Valoarea trebuie să fie între -99 și 99.'
      return null
    },
  },
]

export function MatrixBorderVisualizer() {
  const [grid, setGrid] = useState<number[][]>(DEFAULT_GRID)
  const [fill, setFill] = useState<number>(DEFAULT_FILL)

  const frames = useMemo(
    () => generateMatrixBorder({ grid, fill }),
    [grid, fill],
  )
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [grid, fill, reset])

  const { bordered, kinds, current, phase } = player.currentFrame.state

  function handleLabSubmit(values: Record<string, string>) {
    const g = parseGrid(values.grid ?? '')
    const nums = parseIntegers(values.fill ?? '')
    if (!g || !nums || nums.length !== 1) return
    if (g.length > 6 || g[0].length > 6) return
    if (g.some(row => row.some(n => n < -99 || n > 99))) return
    if (nums[0] < -99 || nums[0] > 99) return
    setGrid(g)
    setFill(nums[0])
  }

  return (
    <VisualizerShell
      title="Bordarea unei matrice — chenar de santinele"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-3 py-2">
        <span className="font-mono text-xs text-muted-foreground">
          matrice bordată ({bordered.length}×{bordered[0].length})
        </span>
        <div className="flex max-w-full flex-col gap-1 overflow-x-auto">
          {bordered.map((row, i) => (
            <div key={i} className="flex gap-1">
              {row.map((value, j) => {
                const kind = kinds[i][j]
                const isCurrent = current?.r === i && current?.c === j
                const isPlaced = kind !== 'empty'

                return (
                  <div
                    key={j}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-[6px] border-2 font-mono text-xs font-semibold tabular-nums transition-all duration-200',
                      isCurrent
                        ? 'scale-110 border-primary bg-accent text-primary'
                        : !isPlaced
                          ? 'border-dashed border-border bg-background text-muted-foreground/40'
                          : kind === 'border'
                            ? 'border-dashed border-muted-foreground/40 bg-muted/40 text-muted-foreground'
                            : 'border-border bg-muted text-foreground',
                    )}
                    aria-label={
                      isPlaced
                        ? kind === 'border'
                          ? `bordată[${i}][${j}] = ${value} (santinelă)`
                          : `bordată[${i}][${j}] = ${value} (element original)`
                        : `bordată[${i}][${j}] (neumplut)`
                    }
                  >
                    {isPlaced ? value : ''}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {phase === 'done' && (
          <div className="mt-2 flex justify-center">
            <div className="rounded-[10px] border border-border bg-muted/50 px-4 py-2 text-center font-mono text-xs text-muted-foreground">
              De ce bordăm? Cu chenarul de santinele, putem accesa vecinii
              oricărui element (sus, jos, stânga, dreapta) fără verificări de
              tip <span className="text-foreground">if (i&gt;0 &amp;&amp; ...)</span> —
              codul devine mai scurt și mai sigur.
            </div>
          </div>
        )}
      </div>
    </VisualizerShell>
  )
}
