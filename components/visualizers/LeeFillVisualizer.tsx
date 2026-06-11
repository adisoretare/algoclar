'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateLeeFill } from '@/lib/visualizers/generators/lee-fill'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_GRID = [
  [0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 1, 0],
  [1, 1, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 0],
]

function parseGrid(raw: string): number[][] | null {
  const rows = raw.split(';').map(s => s.trim()).filter(Boolean)
  if (rows.length === 0) return null
  const grid: number[][] = []
  let width = -1
  for (const row of rows) {
    const nums = parseIntegers(row)
    if (!nums || nums.some(n => n !== 0 && n !== 1)) return null
    if (width === -1) width = nums.length
    else if (nums.length !== width) return null
    grid.push(nums)
  }
  return grid
}

const LAB_FIELDS: LabField[] = [
  {
    id: 'grid',
    label: 'Grila (0 = liber, 1 = perete; linii separate prin ;)',
    placeholder: 'ex: 0 0 0 ; 0 1 0 ; 0 0 0',
    hint: 'Colțul stânga-sus și dreapta-jos trebuie libere · max 7×7',
    validate: raw => {
      const grid = parseGrid(raw)
      if (!grid) return 'Doar 0 și 1, linii de aceeași lungime, separate prin ;.'
      if (grid.length > 7 || grid[0].length > 7) return 'Maximum 7×7.'
      if (grid[0][0] !== 0 || grid[grid.length - 1][grid[0].length - 1] !== 0)
        return 'Colțurile sursă/țintă trebuie să fie libere (0).'
      return null
    },
  },
]

export function LeeFillVisualizer() {
  const [grid, setGrid] = useState<number[][]>(DEFAULT_GRID)
  const source: readonly [number, number] = [0, 0]
  const target: readonly [number, number] = [grid.length - 1, grid[0].length - 1]

  const frames = useMemo(
    () => generateLeeFill({ grid, source, target }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [grid],
  )
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [grid, reset])

  const s = player.currentFrame.state
  const maxDist = Math.max(
    1,
    ...s.dist.flat().filter((d): d is number => d !== null),
  )

  function handleLabSubmit(v: Record<string, string>) {
    const g = parseGrid(v.grid ?? '')
    if (
      g &&
      g.length <= 7 &&
      g[0].length <= 7 &&
      g[0][0] === 0 &&
      g[g.length - 1][g[0].length - 1] === 0
    ) {
      setGrid(g)
    }
  }

  return (
    <VisualizerShell
      title="Algoritmul lui Lee — BFS pe matrice"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="flex flex-col gap-1">
          {s.grid.map((row, r) => (
            <div key={r} className="flex gap-1">
              {row.map((cell, c) => {
                const d = s.dist[r][c]
                const isWall = cell === 1
                const isSource = r === s.source[0] && c === s.source[1]
                const isTarget = r === s.target[0] && c === s.target[1]
                const isCurrent =
                  s.current !== null && s.current[0] === r && s.current[1] === c
                const visited = d !== null
                return (
                  <div
                    key={c}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-[6px] border-2 font-mono text-xs font-semibold tabular-nums transition-all duration-200',
                      isWall
                        ? 'border-foreground/20 bg-foreground/80 text-background'
                        : isCurrent
                          ? 'scale-110 border-primary bg-accent text-primary'
                          : isTarget && s.reachedTarget
                            ? 'border-success bg-success/20 text-success'
                            : 'border-border text-foreground',
                    )}
                    style={
                      !isWall && !isCurrent && visited && !(isTarget && s.reachedTarget)
                        ? {
                            backgroundColor: `hsl(var(--primary) / ${0.12 + 0.5 * ((d as number) / maxDist)})`,
                          }
                        : undefined
                    }
                    aria-label={
                      isWall
                        ? `perete (${r}, ${c})`
                        : `celulă (${r}, ${c})${visited ? `, distanță ${d}` : ''}`
                    }
                  >
                    {isWall ? '' : isSource ? '0' : visited ? d : ''}
                    {isTarget && !visited ? '◎' : ''}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
          <span>sursă (0,0) → distanță 0</span>
          <span>◎ țintă ({s.target[0]},{s.target[1]})</span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-[3px] bg-foreground/80" />
            perete
          </span>
        </div>
      </div>
    </VisualizerShell>
  )
}
