'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateFenwick } from '@/lib/visualizers/generators/fenwick-tree'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_ARRAY = [3, 1, 4, 1, 5, 9, 2, 6]
const DEFAULT_PREFIX = 7

const LAB_FIELDS: LabField[] = [
  {
    id: 'array',
    label: 'Vectorul tău',
    placeholder: 'ex: 3 1 4 1 5 9',
    hint: 'Întregi separați prin spațiu · min 2 · max 12',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums) return 'Introdu numere întregi.'
      if (nums.length < 2 || nums.length > 12) return 'Între 2 și 12 valori.'
      return null
    },
  },
  {
    id: 'prefix',
    label: 'Lungimea prefixului interogat',
    placeholder: 'ex: 7',
    hint: 'Un număr între 1 și lungimea vectorului',
    validate: raw => {
      const n = parseIntegers(raw)
      if (!n || n.length !== 1 || n[0] < 1) return 'Un singur număr ≥ 1.'
      return null
    },
  },
]

function FenwickRow({
  label,
  cells,
  highlightSet,
  current,
}: {
  label: string
  cells: number[]
  highlightSet: Set<number>
  current: number | null
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 text-right font-mono text-[10px] text-muted-foreground">
        {label}
      </span>
      <div className="flex gap-1">
        {cells.map((value, k) => {
          const idx = k + 1 // 1-based
          const hot = highlightSet.has(idx)
          return (
            <div key={k} className="flex flex-col items-center gap-0.5">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-[6px] border-2 font-mono text-xs font-semibold tabular-nums transition-all duration-200',
                  idx === current
                    ? 'scale-110 border-primary bg-accent text-primary'
                    : hot
                      ? 'border-warning bg-warning/15 text-warning'
                      : 'border-border bg-muted text-foreground',
                )}
              >
                {value}
              </div>
              <span className="font-mono text-[9px] text-muted-foreground">
                {idx}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function FenwickVisualizer() {
  const [array, setArray] = useState(DEFAULT_ARRAY)
  const [prefix, setPrefix] = useState(DEFAULT_PREFIX)
  const frames = useMemo(
    () => generateFenwick({ array, queryPrefix: Math.min(prefix, array.length) }),
    [array, prefix],
  )
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [array, prefix, reset])

  const s = player.currentFrame.state
  const touched = new Set(s.touched)
  const n = s.array.length

  function handleLabSubmit(v: Record<string, string>) {
    const nums = parseIntegers(v.array ?? '')
    const p = parseIntegers(v.prefix ?? '')
    if (nums) setArray(nums)
    if (p && p.length === 1) setPrefix(p[0])
  }

  return (
    <VisualizerShell
      title="Fenwick Tree (BIT) — sume de prefix în O(log n)"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-4 py-2">
        <span className="rounded-[8px] bg-primary/10 px-3 py-1 font-mono text-xs font-semibold text-primary">
          {s.phase === 'build'
            ? 'construire'
            : s.phase === 'query'
              ? `prefix(${s.queryIndex})`
              : 'gata'}
        </span>
        <div className="flex flex-col gap-2 overflow-x-auto">
          <FenwickRow
            label="v[]"
            cells={[...s.array]}
            highlightSet={s.phase === 'build' && s.current ? new Set([s.current]) : new Set()}
            current={s.phase === 'build' ? s.current : null}
          />
          <FenwickRow
            label="BIT"
            cells={s.tree.slice(1, n + 1)}
            highlightSet={touched}
            current={s.current}
          />
        </div>
        {s.accumulated !== null && (
          <div className="flex items-center gap-2 rounded-[10px] border border-success/40 bg-success/10 px-4 py-2">
            <span className="font-mono text-xs text-muted-foreground">
              sumă prefix =
            </span>
            <span className="font-mono text-xl font-bold tabular-nums text-success">
              {s.accumulated}
            </span>
          </div>
        )}
      </div>
    </VisualizerShell>
  )
}
