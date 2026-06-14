'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateGreedyIntervals } from '@/lib/visualizers/generators/greedy-intervals'
import { VisualizerShell } from './VisualizerShell'
import { LabInput } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_INTERVALS: Array<{ start: number; end: number }> = [
  { start: 1, end: 3 },
  { start: 2, end: 5 },
  { start: 4, end: 7 },
  { start: 6, end: 9 },
  { start: 8, end: 10 },
  { start: 5, end: 8 },
]

/** Parse "s1 e1 ; s2 e2 ; ..." into pairs, or null if malformed. */
function parsePairs(raw: string): Array<{ start: number; end: number }> | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const chunks = trimmed
    .split(';')
    .map(c => c.trim())
    .filter(c => c.length > 0)
  if (chunks.length === 0) return null
  const pairs: Array<{ start: number; end: number }> = []
  for (const chunk of chunks) {
    const parts = chunk.split(/\s+/)
    if (parts.length !== 2) return null
    const start = parseInt(parts[0], 10)
    const end = parseInt(parts[1], 10)
    if (isNaN(start) || isNaN(end)) return null
    pairs.push({ start, end })
  }
  return pairs
}

const LAB_FIELDS: LabField[] = [
  {
    id: 'intervals',
    label: 'Intervalele tale',
    placeholder: 'ex: 1 3 ; 2 5 ; 4 7 ; 6 9',
    defaultValue: '1 3 ; 2 5 ; 4 7 ; 6 9 ; 8 10 ; 5 8',
    hint: 'Perechi „start sfârșit" separate prin ; · start ≤ sfârșit · 0–30 · max 10 perechi',
    validate: raw => {
      const pairs = parsePairs(raw)
      if (!pairs)
        return 'Scrie perechi „start sfârșit" separate prin ; (ex: 1 3 ; 2 5).'
      if (pairs.length > 10) return 'Maximum 10 intervale.'
      for (const p of pairs) {
        if (p.start > p.end)
          return `Intervalul [${p.start},${p.end}] are începutul mai mare decât sfârșitul.`
        if (p.start < 0 || p.start > 30 || p.end < 0 || p.end > 30)
          return 'Coordonatele trebuie să fie între 0 și 30.'
      }
      return null
    },
  },
]

export function GreedyIntervalsVisualizer() {
  const [intervals, setIntervals] =
    useState<Array<{ start: number; end: number }>>(DEFAULT_INTERVALS)

  const frames = useMemo(
    () => generateGreedyIntervals({ intervals }),
    [intervals],
  )
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [intervals, reset])

  const state = player.currentFrame.state
  const { currentIndex, lastEnd, selectedCount, done } = state
  const items = state.intervals

  // Time axis: 0..max end (at least 1 to avoid div by zero).
  const maxEnd = Math.max(1, ...items.map(it => it.end))
  const span = maxEnd // axis runs 0..maxEnd
  // Thin the labels when the axis is long so they don't collide on small screens.
  const tickStep = maxEnd > 20 ? 5 : maxEnd > 10 ? 2 : 1
  const axisTicks = Array.from({ length: maxEnd + 1 }, (_, i) => i).filter(
    t => t % tickStep === 0 || t === maxEnd,
  )
  const hasMarker = Number.isFinite(lastEnd) && lastEnd >= 0

  function handleLabSubmit(values: Record<string, string>) {
    const pairs = parsePairs(values.intervals ?? '')
    if (pairs) setIntervals(pairs)
  }

  return (
    <VisualizerShell
      title="Greedy — selecția activităților (intervale neîntretăiate)"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col gap-4 py-2">
        {/* Selected count chip */}
        <div className="flex justify-center">
          <div
            className={cn(
              'flex min-w-[160px] flex-col items-center rounded-[10px] border px-4 py-2 transition-colors',
              done
                ? 'border-success/40 bg-success/10'
                : 'border-border bg-muted/50',
            )}
          >
            <span className="font-mono text-xs text-muted-foreground">
              intervale alese
            </span>
            <span
              className={cn(
                'font-mono text-xl font-bold tabular-nums',
                done ? 'text-success' : 'text-primary',
              )}
            >
              {selectedCount}
            </span>
          </div>
        </div>

        {/* Bars on a shared time axis */}
        <div className="relative px-2">
          {/* lastEnd vertical marker */}
          {hasMarker && (
            <div
              className="pointer-events-none absolute inset-y-0 z-10 flex flex-col items-center"
              style={{ left: `${(lastEnd / span) * 100}%` }}
              aria-hidden
            >
              <div className="h-full w-px bg-primary/60" />
            </div>
          )}

          <div
            className="flex flex-col gap-2"
            role="list"
            aria-label="Intervale pe axa timpului"
          >
            {items.map((it, i) => {
              const isCurrent = i === currentIndex && !done
              const rawLeft = (it.start / span) * 100
              const width = Math.max(((it.end - it.start) / span) * 100, 2)
              // Keep zero/near-zero-width bars from spilling past the right edge.
              const left = Math.min(rawLeft, 100 - width)
              const statusLabel =
                it.status === 'selected'
                  ? 'selectat'
                  : it.status === 'rejected'
                    ? 'respins'
                    : 'în așteptare'
              return (
                <div
                  key={it.id}
                  role="listitem"
                  className="relative h-9 w-full"
                >
                  <div
                    className={cn(
                      'absolute top-0 flex h-9 items-center justify-center rounded-[6px] border-2 px-2 font-mono text-xs font-semibold tabular-nums transition-all duration-200',
                      it.status === 'selected' &&
                        'border-success bg-success/15 text-foreground',
                      it.status === 'rejected' &&
                        'border-destructive bg-destructive/15 text-muted-foreground opacity-60',
                      it.status === 'pending' &&
                        'border-border bg-muted text-foreground',
                      isCurrent && 'border-primary ring-2 ring-primary/40',
                    )}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    aria-label={`interval [${it.start},${it.end}], ${statusLabel}`}
                  >
                    {it.start},{it.end}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Time axis */}
          <div
            className="relative mt-2 h-5 border-t border-border"
            aria-hidden
          >
            {axisTicks.map(t => (
              <span
                key={t}
                className="absolute top-1 -translate-x-1/2 font-mono text-[10px] text-muted-foreground"
                style={{ left: `${(t / span) * 100}%` }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* lastEnd readout */}
        <div className="flex justify-center">
          <span className="font-mono text-xs text-muted-foreground">
            ultimul sfârșit:{' '}
            <span className="font-semibold text-foreground">
              {hasMarker ? lastEnd : '—'}
            </span>
          </span>
        </div>
      </div>
    </VisualizerShell>
  )
}
