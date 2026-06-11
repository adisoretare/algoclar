'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateDpTable2D } from '@/lib/visualizers/generators/dp-table-2d'
import { VisualizerShell } from './VisualizerShell'
import { LabInput } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_A = 'ABCBDAB'
const DEFAULT_B = 'BDCAB'

const LAB_FIELDS: LabField[] = [
  {
    id: 'strings',
    label: 'Două șiruri (separate prin spațiu)',
    placeholder: 'ex: ABCBDAB BDCAB',
    defaultValue: 'ABCBDAB BDCAB',
    hint: 'Doar litere · max 10 caractere fiecare',
    validate: raw => {
      const parts = raw.trim().split(/\s+/)
      if (parts.length !== 2) return 'Introdu exact două șiruri.'
      if (parts.some(p => p.length === 0 || p.length > 10))
        return 'Fiecare șir: 1–10 caractere.'
      if (parts.some(p => !/^[A-Za-z]+$/.test(p))) return 'Doar litere.'
      return null
    },
  },
]

function isDep(deps: readonly (readonly [number, number])[], r: number, c: number) {
  return deps.some(([dr, dc]) => dr === r && dc === c)
}

export function DpTable2DVisualizer() {
  const [a, setA] = useState(DEFAULT_A)
  const [b, setB] = useState(DEFAULT_B)
  const frames = useMemo(() => generateDpTable2D({ a, b }), [a, b])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [a, b, reset])

  const s = player.currentFrame.state

  function handleLabSubmit(v: Record<string, string>) {
    const parts = (v.strings ?? '').trim().split(/\s+/)
    if (
      parts.length === 2 &&
      parts.every(p => p.length >= 1 && p.length <= 10 && /^[A-Za-z]+$/.test(p))
    ) {
      setA(parts[0].toUpperCase())
      setB(parts[1].toUpperCase())
    }
  }

  return (
    <VisualizerShell
      title="Tabel DP 2D — cea mai lungă subsecvență comună (LCS)"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="inline-block overflow-x-auto">
          <table className="border-separate border-spacing-1">
            <thead>
              <tr>
                <th />
                <th className="h-7 w-7 font-mono text-[10px] text-muted-foreground">∅</th>
                {s.b.split('').map((ch, j) => (
                  <th
                    key={j}
                    className={cn(
                      'h-7 w-7 font-mono text-xs font-bold',
                      s.curC === j + 1 ? 'text-primary' : 'text-foreground',
                    )}
                  >
                    {ch}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.table.map((row, i) => (
                <tr key={i}>
                  <th
                    className={cn(
                      'h-8 w-7 font-mono text-xs font-bold',
                      s.curR === i ? 'text-primary' : 'text-foreground',
                    )}
                  >
                    {i === 0 ? '∅' : s.a[i - 1]}
                  </th>
                  {row.map((value, j) => {
                    const isCurrent = s.curR === i && s.curC === j
                    const dep = !isCurrent && isDep(s.deps, i, j)
                    return (
                      <td key={j}>
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-[6px] border-2 font-mono text-xs font-semibold tabular-nums transition-all duration-200',
                            isCurrent
                              ? cn(
                                  'scale-110 border-primary text-primary',
                                  s.match ? 'bg-success/20' : 'bg-accent',
                                )
                              : dep
                                ? 'border-success bg-success/15 text-success'
                                : value === null
                                  ? 'border-dashed border-border/60 bg-transparent text-muted-foreground/30'
                                  : i === 0 || j === 0
                                    ? 'border-border bg-muted/40 text-muted-foreground'
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

        {s.done && s.result !== null && (
          <div className="flex items-center gap-2 rounded-[10px] border border-success/40 bg-success/10 px-4 py-2">
            <span className="font-mono text-xs text-muted-foreground">LCS =</span>
            <span className="font-mono text-xl font-bold tabular-nums text-success">
              {s.result}
            </span>
          </div>
        )}
      </div>
    </VisualizerShell>
  )
}
