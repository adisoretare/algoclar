'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateBitmaskDp } from '@/lib/visualizers/generators/bitmask-dp'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_DIST = [
  [0, 10, 15, 20],
  [10, 0, 35, 25],
  [15, 35, 0, 30],
  [20, 25, 30, 0],
]

function parseMatrix(raw: string): number[][] | null {
  const rows = raw.split(';').map(s => s.trim()).filter(Boolean)
  if (rows.length < 2) return null
  const m: number[][] = []
  for (const row of rows) {
    const nums = parseIntegers(row)
    if (!nums || nums.length !== rows.length) return null
    if (nums.some(x => x < 0)) return null
    m.push(nums)
  }
  return m
}

const LAB_FIELDS: LabField[] = [
  {
    id: 'dist',
    label: 'Matricea distanțelor (linii separate prin ;)',
    placeholder: 'ex: 0 10 15 ; 10 0 35 ; 15 35 0',
    defaultValue: '0 10 15 20 ; 10 0 35 25 ; 15 35 0 30 ; 20 25 30 0',
    hint: 'Matrice pătratică · 2–6 orașe · valori ≥ 0',
    validate: raw => {
      const m = parseMatrix(raw)
      if (!m) return 'Matrice pătratică de întregi ≥ 0, linii separate prin ;.'
      if (m.length > 6) return 'Maximum 6 orașe.'
      return null
    },
  },
]

export function BitmaskDpVisualizer() {
  const [dist, setDist] = useState<number[][]>(DEFAULT_DIST)
  const frames = useMemo(() => generateBitmaskDp({ dist }), [dist])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [dist, reset])

  const s = player.currentFrame.state
  const n = s.n
  const masks = Array.from({ length: 1 << n }, (_, m) => m).filter(m => m & 1)

  function handleLabSubmit(v: Record<string, string>) {
    const m = parseMatrix(v.dist ?? '')
    if (m && m.length <= 6) setDist(m)
  }

  return (
    <VisualizerShell
      title="DP pe biți (bitmask) — comis-voiajor (TSP)"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-4 py-2 sm:flex-row sm:items-start sm:justify-center sm:gap-8">
        {/* dp table */}
        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="px-1 font-mono text-[10px] text-muted-foreground">
                  mask \ end
                </th>
                {Array.from({ length: n }, (_, i) => (
                  <th key={i} className="h-6 w-10 font-mono text-[10px] text-muted-foreground">
                    {i}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {masks.map(mask => (
                <tr key={mask}>
                  <th className="px-1 text-right font-mono text-[10px] font-semibold text-foreground">
                    {mask.toString(2).padStart(n, '0')}
                  </th>
                  {Array.from({ length: n }, (_, i) => {
                    const value = s.dp[mask]?.[i] ?? null
                    const isCurrent = s.mask === mask && s.endCity === i
                    return (
                      <td key={i}>
                        <div
                          className={cn(
                            'flex h-7 w-10 items-center justify-center rounded-[5px] border font-mono text-[11px] font-semibold tabular-nums transition-all duration-200',
                            isCurrent
                              ? 'scale-110 border-primary bg-accent text-primary'
                              : value === null
                                ? 'border-dashed border-border/40 text-muted-foreground/20'
                                : 'border-border bg-muted text-foreground',
                          )}
                        >
                          {value === null ? '' : value}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* dist matrix + result */}
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-[10px] text-muted-foreground">distanțe</span>
          <table className="border-separate border-spacing-1">
            <tbody>
              {s.dist.map((row, i) => (
                <tr key={i}>
                  {row.map((d, j) => (
                    <td key={j}>
                      <div className="flex h-7 w-7 items-center justify-center rounded-[5px] border border-border bg-muted/60 font-mono text-[10px] tabular-nums text-muted-foreground">
                        {d}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {s.result !== null && (
            <div className="flex items-center gap-2 rounded-[10px] border border-success/40 bg-success/10 px-3 py-1.5">
              <span className="font-mono text-[10px] text-muted-foreground">
                tur minim =
              </span>
              <span className="font-mono text-lg font-bold tabular-nums text-success">
                {s.result}
              </span>
            </div>
          )}
        </div>
      </div>
    </VisualizerShell>
  )
}
