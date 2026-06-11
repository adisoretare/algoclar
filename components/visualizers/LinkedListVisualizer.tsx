'use client'

import { useMemo, useEffect, useState, Fragment } from 'react'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateLinkedList } from '@/lib/visualizers/generators/linked-list'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_VALUES = [4, 8, 15, 16, 23]

const LAB_FIELDS: LabField[] = [
  {
    id: 'values',
    label: 'Valorile nodurilor',
    placeholder: 'ex: 4 8 15 16 23',
    defaultValue: '4 8 15 16 23',
    hint: 'Numere întregi separate prin spațiu · min 3 · max 8 valori',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums) return 'Introdu numere întregi separate prin spațiu.'
      if (nums.length < 3) return 'Introdu cel puțin 3 valori.'
      if (nums.length > 8) return 'Maximum 8 valori.'
      return null
    },
  },
]

export function LinkedListVisualizer() {
  const [values, setValues] = useState(DEFAULT_VALUES)
  const frames = useMemo(() => generateLinkedList({ values }), [values])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [values, reset])

  const { nodes, phase, highlight, prev, marked } = player.currentFrame.state

  function handleLabSubmit(v: Record<string, string>) {
    const nums = parseIntegers(v.values ?? '')
    if (nums) setValues(nums)
  }

  return (
    <VisualizerShell
      title="Listă simplu înlănțuită — noduri legate prin pointeri"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-3 py-2">
        <span className="font-mono text-xs text-muted-foreground">
          head{' '}
          <span className="text-foreground">
            {phase === 'build'
              ? '· construim'
              : phase === 'traverse'
                ? '· parcurgem'
                : phase === 'delete'
                  ? '· ștergem'
                  : '· gata'}
          </span>
        </span>
        <div className="flex flex-wrap items-center justify-center gap-1">
          {nodes.map((value, i) => {
            const isCurrent = i === highlight
            const isPrev = i === prev
            const isMarked = i === marked
            const isLast = i === nodes.length - 1
            return (
              <Fragment key={i}>
                <div
                  className={cn(
                    'flex h-12 min-w-[48px] items-center justify-center rounded-[8px] border-2 px-2 font-mono text-base font-semibold tabular-nums transition-all duration-200',
                    isMarked
                      ? 'scale-105 border-destructive bg-destructive/10 text-destructive line-through'
                      : isCurrent
                        ? 'scale-105 border-primary bg-accent text-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]'
                        : isPrev
                          ? 'border-warning bg-warning/10 text-warning'
                          : 'border-border bg-muted text-foreground',
                  )}
                >
                  {value}
                </div>
                {isLast ? (
                  <span className="ml-1 font-mono text-[10px] text-muted-foreground">
                    → null
                  </span>
                ) : (
                  <ArrowRight
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      isPrev ? 'text-warning' : 'text-muted-foreground',
                    )}
                    aria-hidden
                  />
                )}
              </Fragment>
            )
          })}
        </div>
      </div>
    </VisualizerShell>
  )
}
