'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateSetMap } from '@/lib/visualizers/generators/set-map'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT = {
  setValues: [5, 1, 8, 3, 1, 5, 9],
  contains: 8,
  pairs: [
    { k: 2, v: 20 },
    { k: 7, v: 70 },
    { k: 4, v: 40 },
  ],
  getKey: 7,
}

const LAB_FIELDS: LabField[] = [
  {
    id: 'set',
    label: 'Valori pentru mulțime',
    placeholder: 'ex: 5 1 8 3',
    defaultValue: '5 1 8 3 1 5 9',
    hint: 'Întregi separați prin spațiu · duplicatele se ignoră · max 12',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums) return 'Introdu numere întregi.'
      if (nums.length < 1 || nums.length > 12) return 'Între 1 și 12 valori.'
      return null
    },
  },
  {
    id: 'contains',
    label: 'Valoare căutată (contains)',
    placeholder: 'ex: 8',
    defaultValue: '8',
    hint: 'Un singur număr',
    validate: raw => {
      const n = parseIntegers(raw)
      if (!n || n.length !== 1) return 'Un singur număr.'
      return null
    },
  },
]

export function SetMapVisualizer() {
  const [setValues, setSetValues] = useState(DEFAULT.setValues)
  const [contains, setContains] = useState(DEFAULT.contains)

  const frames = useMemo(
    () =>
      generateSetMap({
        setValues,
        contains,
        pairs: DEFAULT.pairs,
        getKey: DEFAULT.getKey,
      }),
    [setValues, contains],
  )
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [setValues, contains, reset])

  const s = player.currentFrame.state

  function handleLabSubmit(v: Record<string, string>) {
    const nums = parseIntegers(v.set ?? '')
    const c = parseIntegers(v.contains ?? '')
    if (nums) setSetValues(nums)
    if (c && c.length === 1) setContains(c[0])
  }

  return (
    <VisualizerShell
      title="Mulțime ordonată & dicționar (set / map)"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-6 py-2">
        {/* Ordered set */}
        <div className="flex flex-col items-center gap-2">
          <span
            className={cn(
              'font-mono text-xs',
              s.phase === 'set' || s.phase === 'query-set'
                ? 'font-semibold text-primary'
                : 'text-muted-foreground',
            )}
          >
            mulțime ordonată
          </span>
          <div className="flex min-h-[44px] flex-wrap justify-center gap-1.5" role="list">
            {s.set.length === 0 && (
              <span className="font-mono text-xs text-muted-foreground/50">∅</span>
            )}
            {s.set.map((value, i) => {
              const active = i === s.setHighlight
              const isQueryHit =
                s.phase === 'query-set' && s.found === true && active
              return (
                <div
                  key={i}
                  role="listitem"
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-[8px] border-2 font-mono text-sm font-semibold tabular-nums transition-all duration-200',
                    isQueryHit
                      ? 'scale-110 border-success bg-success/15 text-success'
                      : active
                        ? 'scale-110 border-primary bg-accent text-primary'
                        : 'border-border bg-muted text-foreground',
                  )}
                >
                  {value}
                </div>
              )
            })}
          </div>
        </div>

        {/* Map */}
        <div className="flex flex-col items-center gap-2">
          <span
            className={cn(
              'font-mono text-xs',
              s.phase === 'map' || s.phase === 'query-map'
                ? 'font-semibold text-primary'
                : 'text-muted-foreground',
            )}
          >
            dicționar (cheie → valoare)
          </span>
          <div className="flex min-h-[44px] flex-wrap justify-center gap-2">
            {s.map.length === 0 && (
              <span className="font-mono text-xs text-muted-foreground/50">∅</span>
            )}
            {s.map.map((e, i) => {
              const active = i === s.mapHighlight
              const isHit = s.phase === 'query-map' && s.found === true && active
              return (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-1 rounded-[8px] border-2 px-2.5 py-1.5 font-mono text-sm font-semibold tabular-nums transition-all duration-200',
                    isHit
                      ? 'scale-105 border-success bg-success/15 text-success'
                      : active
                        ? 'scale-105 border-primary bg-accent text-primary'
                        : 'border-border bg-muted text-foreground',
                  )}
                >
                  <span>{e.k}</span>
                  <span className="text-muted-foreground">→</span>
                  <span>{e.v}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Query result */}
        {(s.phase === 'query-set' || s.phase === 'query-map') && s.queryResult && (
          <div
            className={cn(
              'rounded-[10px] border px-4 py-2 font-mono text-sm font-semibold',
              s.found
                ? 'border-success/40 bg-success/10 text-success'
                : 'border-destructive/40 bg-destructive/10 text-destructive',
            )}
          >
            {s.phase === 'query-set'
              ? `contains(${s.queryArg}) → ${s.queryResult}`
              : `get(${s.queryArg}) → ${s.queryResult}`}
          </div>
        )}
      </div>
    </VisualizerShell>
  )
}
