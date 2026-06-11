'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateBacktracking } from '@/lib/visualizers/generators/backtracking'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_ITEMS = [3, 1, 4, 2]
const DEFAULT_TARGET = 5

const LAB_FIELDS: LabField[] = [
  {
    id: 'items',
    label: 'Mulțimea de numere',
    placeholder: 'ex: 3 1 4 2',
    defaultValue: '3 1 4 2',
    hint: 'Întregi ≥ 0 separați prin spațiu · min 1 · max 6',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums) return 'Introdu numere întregi.'
      if (nums.length < 1 || nums.length > 6) return 'Între 1 și 6 valori.'
      if (nums.some(n => n < 0)) return 'Valorile trebuie să fie ≥ 0.'
      return null
    },
  },
  {
    id: 'target',
    label: 'Suma căutată',
    placeholder: 'ex: 5',
    defaultValue: '5',
    hint: 'Un singur număr',
    validate: raw => {
      const n = parseIntegers(raw)
      if (!n || n.length !== 1) return 'Un singur număr.'
      return null
    },
  },
]

const EVENT_LABEL: Record<string, string> = {
  enter: 'pornire',
  include: 'includem',
  exclude: 'excludem',
  prune: 'tăiere',
  found: 'soluție găsită',
  deadend: 'înfundătură',
}

export function BacktrackingVisualizer() {
  const [items, setItems] = useState(DEFAULT_ITEMS)
  const [target, setTarget] = useState(DEFAULT_TARGET)
  const frames = useMemo(
    () => generateBacktracking({ items, target }),
    [items, target],
  )
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [items, target, reset])

  const s = player.currentFrame.state

  function handleLabSubmit(v: Record<string, string>) {
    const nums = parseIntegers(v.items ?? '')
    const t = parseIntegers(v.target ?? '')
    if (nums && nums.every(n => n >= 0)) setItems(nums)
    if (t && t.length === 1) setTarget(t[0])
  }

  const eventTone =
    s.event === 'prune' || s.event === 'deadend'
      ? 'bg-destructive/10 text-destructive'
      : s.event === 'found'
        ? 'bg-success/10 text-success'
        : 'bg-primary/10 text-primary'

  return (
    <VisualizerShell
      title="Backtracking — submulțime cu sumă dată, cu tăieri"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-5 py-2">
        {/* Status */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className={cn('rounded-[8px] px-3 py-1 font-mono text-xs font-semibold', eventTone)}>
            {EVENT_LABEL[s.event] ?? s.event}
          </span>
          <div className="flex items-center gap-2 rounded-[8px] border border-border bg-muted/50 px-3 py-1 font-mono text-xs">
            <span className="text-muted-foreground">sumă</span>
            <span
              className={cn(
                'text-base font-bold tabular-nums',
                s.partial > s.target
                  ? 'text-destructive'
                  : s.partial === s.target
                    ? 'text-success'
                    : 'text-foreground',
              )}
            >
              {s.partial}
            </span>
            <span className="text-muted-foreground">/ țintă {s.target}</span>
          </div>
        </div>

        {/* Items with decisions */}
        <div className="flex flex-wrap justify-center gap-1.5" role="list">
          {s.items.map((value, i) => {
            const status = s.status[i]
            const isCursor = i === s.depth && !s.done
            return (
              <div key={i} role="listitem" className="flex flex-col items-center gap-1">
                <div className="flex h-4 items-end">
                  {isCursor && (
                    <span className="font-mono text-[10px] font-bold text-primary">▼</span>
                  )}
                </div>
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-[8px] border-2 font-mono text-base font-semibold tabular-nums transition-all duration-200',
                    status === 'in'
                      ? 'border-success bg-success/15 text-success'
                      : status === 'out'
                        ? 'border-border bg-muted/50 text-muted-foreground/50 line-through'
                        : isCursor
                          ? 'border-primary bg-accent text-primary'
                          : 'border-border bg-muted text-foreground',
                  )}
                >
                  {value}
                </div>
                <span className="font-mono text-[9px] text-muted-foreground">
                  {status === 'in' ? 'în' : status === 'out' ? 'afară' : '—'}
                </span>
              </div>
            )
          })}
        </div>

        {/* Solutions */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="font-mono text-[11px] text-muted-foreground">
            soluții găsite: {s.solutions.length}
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            {s.solutions.map((sol, i) => (
              <span
                key={i}
                className="rounded-[8px] border border-success/40 bg-success/10 px-2.5 py-1 font-mono text-xs font-semibold text-success"
              >
                {'{ '}
                {sol.join(', ')}
                {' }'}
              </span>
            ))}
          </div>
        </div>
      </div>
    </VisualizerShell>
  )
}
