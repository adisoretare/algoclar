'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateDifferenceArray } from '@/lib/visualizers/generators/difference-array'
import type { RangeUpdate } from '@/lib/visualizers/generators/difference-array'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_N = 9
const DEFAULT_UPDATES: RangeUpdate[] = [
  { l: 1, r: 4, val: 3 },
  { l: 2, r: 6, val: 2 },
  { l: 0, r: 3, val: -1 },
]

/** Parses updates "l r val" separated by ";". Returns null on error. */
function parseUpdates(raw: string): RangeUpdate[] | null {
  const parts = raw
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
  if (parts.length === 0) return null
  const updates: RangeUpdate[] = []
  for (const p of parts) {
    const nums = parseIntegers(p)
    if (!nums || nums.length !== 3) return null
    const [l, r, val] = nums
    if (l > r) return null
    updates.push({ l, r, val })
  }
  return updates
}

const LAB_FIELDS: LabField[] = [
  {
    id: 'n',
    label: 'Lungimea vectorului (n)',
    placeholder: 'ex: 9',
    hint: 'Un număr între 2 și 16',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums || nums.length !== 1) return 'Introdu un singur număr.'
      if (nums[0] < 2 || nums[0] > 16) return 'n trebuie să fie între 2 și 16.'
      return null
    },
  },
  {
    id: 'updates',
    label: 'Update-uri: l r val (separate prin ;)',
    placeholder: 'ex: 1 4 3 ; 2 6 2 ; 0 3 -1',
    hint: 'Fiecare update: poziția de start, de final și valoarea adăugată',
    validate: raw => {
      const ups = parseUpdates(raw)
      if (!ups) return 'Fiecare update are 3 numere (l r val), separate prin ;.'
      return null
    },
  },
]

export function DifferenceArrayVisualizer() {
  const [n, setN] = useState(DEFAULT_N)
  const [updates, setUpdates] = useState<RangeUpdate[]>(DEFAULT_UPDATES)

  const frames = useMemo(
    () => generateDifferenceArray({ n, updates }),
    [n, updates],
  )
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [n, updates, reset])

  const {
    diff,
    result,
    phase,
    updateIndex,
    update,
    touched,
    rebuildIndex,
  } = player.currentFrame.state

  function handleLabSubmit(values: Record<string, string>) {
    const nv = parseIntegers(values.n ?? '')
    const ups = parseUpdates(values.updates ?? '')
    if (!nv || nv.length !== 1 || !ups) return
    const nn = nv[0]
    if (nn < 2 || nn > 16) return
    if (ups.some(u => u.l < 0 || u.r >= nn || u.l > u.r)) return
    setN(nn)
    setUpdates(ups)
  }

  return (
    <VisualizerShell
      title="Vector de diferențe — update pe interval în O(1)"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-6 py-2">
        {/* Updates list */}
        <div className="flex flex-wrap justify-center gap-2">
          {updates.map((u, i) => {
            const isActive = phase === 'apply' && i === updateIndex
            const isDone = phase !== 'apply' || (updateIndex >= 0 && i < updateIndex)
            return (
              <span
                key={i}
                className={cn(
                  'rounded-[8px] border px-2.5 py-1 font-mono text-xs transition-colors',
                  isActive
                    ? 'border-primary bg-accent text-primary'
                    : isDone
                      ? 'border-success/40 bg-success/10 text-success'
                      : 'border-border bg-muted text-muted-foreground',
                )}
              >
                [{u.l},{u.r}] {u.val >= 0 ? `+${u.val}` : u.val}
              </span>
            )
          })}
        </div>

        {/* Difference array (n+1) */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            diff (n+1 poziții)
          </span>
          <div className="flex flex-wrap justify-center gap-1.5" role="list">
            {diff.map((value, i) => {
              const isTouched = touched.includes(i)
              const isStart = update !== null && i === update.l
              return (
                <div key={i} role="listitem" className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-[8px] border-2 font-mono text-sm font-semibold tabular-nums transition-all duration-200',
                      isTouched
                        ? isStart
                          ? 'scale-110 border-primary bg-accent text-primary'
                          : 'scale-110 border-warning bg-warning/15 text-warning'
                        : value !== 0
                          ? 'border-primary/30 bg-primary/5 text-foreground'
                          : 'border-border bg-muted text-foreground',
                    )}
                    aria-label={`diff[${i}] = ${value}`}
                  >
                    {value}
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    [{i}]
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Result array (n) */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            vector final (suma prefix peste diff)
          </span>
          <div className="flex flex-wrap justify-center gap-1.5" role="list">
            {Array.from({ length: n }, (_, i) => {
              const filled = i < result.length
              const value = result[i]
              const justBuilt = phase === 'rebuild' && i === rebuildIndex
              return (
                <div key={i} role="listitem" className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-[8px] border-2 font-mono text-sm font-semibold tabular-nums transition-all duration-200',
                      !filled
                        ? 'border-dashed border-border bg-transparent text-muted-foreground/30'
                        : justBuilt
                          ? 'scale-110 border-success bg-success/15 text-success'
                          : 'border-success/40 bg-success/5 text-success',
                    )}
                    aria-label={filled ? `a[${i}] = ${value}` : `poziția ${i} încă necalculată`}
                  >
                    {filled ? value : ''}
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    [{i}]
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </VisualizerShell>
  )
}
