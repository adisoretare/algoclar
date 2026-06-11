'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateRecursion } from '@/lib/visualizers/generators/recursion'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_N = 5

const LAB_FIELDS: LabField[] = [
  {
    id: 'n',
    label: 'Calculează factorial(n)',
    placeholder: 'ex: 5',
    defaultValue: '5',
    hint: 'Un întreg între 1 și 9',
    validate: raw => {
      const n = parseIntegers(raw)
      if (!n || n.length !== 1) return 'Introdu un singur număr.'
      if (n[0] < 1 || n[0] > 9) return 'n între 1 și 9.'
      return null
    },
  },
]

export function RecursionVisualizer() {
  const [n, setN] = useState(DEFAULT_N)
  const frames = useMemo(() => generateRecursion({ n }), [n])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [n, reset])

  const { stack, phase, active, result } = player.currentFrame.state

  function handleLabSubmit(v: Record<string, string>) {
    const nums = parseIntegers(v.n ?? '')
    if (nums && nums.length === 1 && nums[0] >= 1 && nums[0] <= 9) setN(nums[0])
  }

  return (
    <VisualizerShell
      title="Recursivitate — stiva de apeluri pentru factorial(n)"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-3 py-2">
        <span
          className={cn(
            'rounded-[8px] px-3 py-1 font-mono text-xs font-semibold',
            phase === 'descend'
              ? 'bg-primary/10 text-primary'
              : phase === 'base'
                ? 'bg-warning/15 text-warning'
                : 'bg-success/10 text-success',
          )}
        >
          {phase === 'descend'
            ? 'coborâm în recursie'
            : phase === 'base'
              ? 'caz de bază'
              : phase === 'ascend'
                ? 'ne întoarcem (return)'
                : `factorial = ${result}`}
        </span>

        <div className="flex w-60 flex-col gap-1">
          <span className="text-center font-mono text-[10px] text-muted-foreground">
            ↑ vârful stivei (apelul curent)
          </span>
          {[...stack].reverse().map((entry, ri) => {
            const i = stack.length - 1 - ri
            const isActive = i === active
            return (
              <div
                key={i}
                className={cn(
                  'flex items-center justify-between rounded-[8px] border-2 px-3 py-2 font-mono text-sm transition-all duration-200',
                  isActive
                    ? 'border-primary bg-accent text-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]'
                    : entry.ret !== null
                      ? 'border-success/40 bg-success/5 text-success'
                      : 'border-border bg-muted text-foreground',
                )}
              >
                <span className="font-semibold">factorial({entry.n})</span>
                <span className="tabular-nums">
                  {entry.ret !== null ? `= ${entry.ret}` : '…'}
                </span>
              </div>
            )
          })}
          <span className="text-center font-mono text-[10px] text-muted-foreground">
            baza stivei (primul apel)
          </span>
        </div>
      </div>
    </VisualizerShell>
  )
}
