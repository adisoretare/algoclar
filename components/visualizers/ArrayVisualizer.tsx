'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { VisualizerShell } from './VisualizerShell'
import { generateArrayTraversal } from '@/lib/visualizers/generators/array-traversal'

const DEFAULT_ARRAY = [3, 7, 2, 9, 1, 5, 8, 4]

export function ArrayVisualizer() {
  // Frames are pure data — stable reference, computed once
  const frames = useMemo(
    () => generateArrayTraversal({ array: DEFAULT_ARRAY }),
    [],
  )
  const player = useStepPlayer(frames)
  const { array, currentIndex, maxValue, maxIndex, sum, done } =
    player.currentFrame.state

  return (
    <VisualizerShell
      title="Parcurgerea unui vector — max și sumă"
      player={player}
      frameCount={frames.length}
    >
      <div className="flex flex-col items-center gap-6 py-2">
        {/* ── Array cells ─────────────────────────────────────────── */}
        <div
          className="flex flex-wrap justify-center gap-2"
          role="list"
          aria-label="Vectorul v"
        >
          {array.map((value, i) => {
            // currentIndex is -1 when done → isCurrent is always false at end
            const isCurrent = i === currentIndex
            // Max highlight only when cell is not also the current (current takes priority)
            const isMax = !isCurrent && i === maxIndex

            return (
              <div
                key={i}
                role="listitem"
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-[10px] border-2 font-mono text-base font-semibold transition-all duration-200',
                    isCurrent
                      ? // Active cell: primary blue ring + subtle glow
                        'scale-110 border-primary bg-accent text-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]'
                      : isMax
                        ? // Current maximum: success green
                          'border-success bg-success/10 text-success'
                        : done
                          ? // Traversal done, non-max cells: muted
                            'border-border bg-muted/60 text-muted-foreground'
                          : // Normal unvisited / visited cell
                            'border-border bg-muted text-foreground',
                  )}
                  aria-current={isCurrent ? 'true' : undefined}
                  aria-label={`v[${i}] = ${value}${isCurrent ? ', vizitat acum' : ''}${isMax ? ', maxim curent' : ''}`}
                >
                  {value}
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  [{i}]
                </span>
              </div>
            )
          })}
        </div>

        {/* ── Stats panel ──────────────────────────────────────────── */}
        <div className="flex gap-3">
          <StatChip
            label="max"
            value={maxValue}
            variant="success"
            emphasized={done}
          />
          <StatChip
            label="sumă"
            value={sum}
            variant="primary"
            emphasized={done}
          />
        </div>
      </div>
    </VisualizerShell>
  )
}

// ── StatChip ──────────────────────────────────────────────────────────────────
// Small info chip showing a running value. `emphasized` triggers a subtle
// color wash when the traversal completes, reinforcing the "done" state.

interface StatChipProps {
  label: string
  value: number
  variant: 'primary' | 'success'
  emphasized: boolean
}

function StatChip({ label, value, variant, emphasized }: StatChipProps) {
  return (
    <div
      className={cn(
        'flex min-w-[88px] flex-col items-center rounded-[10px] border px-4 py-2 transition-all duration-300',
        emphasized
          ? variant === 'success'
            ? 'border-success/40 bg-success/10'
            : 'border-primary/30 bg-primary/10'
          : 'border-border bg-muted/50',
      )}
    >
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          'font-mono text-xl font-bold tabular-nums transition-all duration-200',
          variant === 'success' ? 'text-success' : 'text-primary',
        )}
      >
        {value}
      </span>
    </div>
  )
}
