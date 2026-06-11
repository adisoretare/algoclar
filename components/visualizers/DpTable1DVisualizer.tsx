'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateDpTable1D } from '@/lib/visualizers/generators/dp-table-1d'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_N = 10

const LAB_FIELDS: LabField[] = [
  {
    id: 'n',
    label: 'Calculează Fibonacci până la n',
    placeholder: 'ex: 10',
    defaultValue: '10',
    hint: 'Un întreg între 2 și 20',
    validate: raw => {
      const n = parseIntegers(raw)
      if (!n || n.length !== 1) return 'Introdu un singur număr.'
      if (n[0] < 2 || n[0] > 20) return 'n între 2 și 20.'
      return null
    },
  },
]

export function DpTable1DVisualizer() {
  const [n, setN] = useState(DEFAULT_N)
  const frames = useMemo(() => generateDpTable1D({ n }), [n])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [n, reset])

  const { table, current, deps, done } = player.currentFrame.state

  function handleLabSubmit(v: Record<string, string>) {
    const nums = parseIntegers(v.n ?? '')
    if (nums && nums.length === 1 && nums[0] >= 2 && nums[0] <= 20) setN(nums[0])
  }

  return (
    <VisualizerShell
      title="Tabel DP 1D — Fibonacci de jos în sus"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="flex flex-wrap justify-center gap-1.5" role="list">
          {table.map((value, i) => {
            const isCurrent = i === current
            const isDep = deps.includes(i)
            return (
              <div key={i} role="listitem" className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-[8px] border-2 font-mono text-sm font-semibold tabular-nums transition-all duration-200',
                    isCurrent
                      ? 'scale-110 border-primary bg-accent text-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]'
                      : isDep
                        ? 'border-success bg-success/15 text-success'
                        : value === null
                          ? 'border-dashed border-border bg-transparent text-muted-foreground/30'
                          : done
                            ? 'border-success/40 bg-success/5 text-success'
                            : 'border-border bg-muted text-foreground',
                  )}
                >
                  {value === null ? '' : value}
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  [{i}]
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </VisualizerShell>
  )
}
