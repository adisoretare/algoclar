'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateKnapsack } from '@/lib/visualizers/generators/knapsack'
import type { KnapsackItem } from '@/lib/visualizers/generators/knapsack'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_ITEMS: KnapsackItem[] = [
  { w: 1, v: 1 },
  { w: 3, v: 4 },
  { w: 4, v: 5 },
  { w: 5, v: 7 },
]
const DEFAULT_CAP = 7

function parseItems(raw: string): KnapsackItem[] | null {
  const parts = raw.split(';').map(s => s.trim()).filter(Boolean)
  if (parts.length === 0) return null
  const items: KnapsackItem[] = []
  for (const p of parts) {
    const nums = parseIntegers(p)
    if (!nums || nums.length !== 2 || nums[0] < 0 || nums[1] < 0) return null
    items.push({ w: nums[0], v: nums[1] })
  }
  return items
}

const LAB_FIELDS: LabField[] = [
  {
    id: 'items',
    label: 'Obiecte: greutate valoare (separate prin ;)',
    placeholder: 'ex: 1 1 ; 3 4 ; 4 5 ; 5 7',
    hint: 'Fiecare obiect: greutate și valoare · max 6 obiecte',
    validate: raw => {
      const items = parseItems(raw)
      if (!items) return 'Fiecare obiect: 2 numere ≥ 0, separate prin ;.'
      if (items.length > 6) return 'Maximum 6 obiecte.'
      return null
    },
  },
  {
    id: 'capacity',
    label: 'Capacitatea rucsacului',
    placeholder: 'ex: 7',
    hint: 'Un întreg între 1 și 14',
    validate: raw => {
      const n = parseIntegers(raw)
      if (!n || n.length !== 1) return 'Un singur număr.'
      if (n[0] < 1 || n[0] > 14) return 'Între 1 și 14.'
      return null
    },
  },
]

export function KnapsackVisualizer() {
  const [items, setItems] = useState<KnapsackItem[]>(DEFAULT_ITEMS)
  const [capacity, setCapacity] = useState(DEFAULT_CAP)
  const frames = useMemo(
    () => generateKnapsack({ items, capacity }),
    [items, capacity],
  )
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [items, capacity, reset])

  const s = player.currentFrame.state

  function handleLabSubmit(v: Record<string, string>) {
    const it = parseItems(v.items ?? '')
    const cap = parseIntegers(v.capacity ?? '')
    if (it && it.length <= 6) setItems(it)
    if (cap && cap.length === 1 && cap[0] >= 1 && cap[0] <= 14) setCapacity(cap[0])
  }

  const isDep = (r: number, c: number) =>
    s.deps.some(([dr, dc]) => dr === r && dc === c)

  return (
    <VisualizerShell
      title="Rucsac 0/1 — tabel de programare dinamică"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-3 py-2">
        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="px-1 font-mono text-[10px] text-muted-foreground">
                  obiect \ cap
                </th>
                {Array.from({ length: s.capacity + 1 }, (_, c) => (
                  <th
                    key={c}
                    className={cn(
                      'h-6 w-8 font-mono text-[10px]',
                      s.curCap === c ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.table.map((row, i) => (
                <tr key={i}>
                  <th className="whitespace-nowrap px-1 text-right font-mono text-[10px] font-semibold">
                    {i === 0 ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span className={s.curItem === i ? 'text-primary' : 'text-foreground'}>
                        {i}: g{s.items[i - 1].w} v{s.items[i - 1].v}
                      </span>
                    )}
                  </th>
                  {row.map((value, c) => {
                    const isCurrent = s.curItem === i && s.curCap === c
                    const dep = !isCurrent && isDep(i, c)
                    return (
                      <td key={c}>
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-[6px] border-2 font-mono text-xs font-semibold tabular-nums transition-all duration-200',
                            isCurrent
                              ? cn(
                                  'scale-110 border-primary text-primary',
                                  s.took ? 'bg-success/20' : 'bg-accent',
                                )
                              : dep
                                ? 'border-success bg-success/15 text-success'
                                : value === null
                                  ? 'border-dashed border-border/60 bg-transparent text-muted-foreground/30'
                                  : i === 0 || c === 0
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
            <span className="font-mono text-xs text-muted-foreground">
              valoare maximă =
            </span>
            <span className="font-mono text-xl font-bold tabular-nums text-success">
              {s.result}
            </span>
          </div>
        )}
      </div>
    </VisualizerShell>
  )
}
