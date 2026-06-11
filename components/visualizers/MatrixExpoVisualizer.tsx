'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateMatrixExpo } from '@/lib/visualizers/generators/matrix-expo'
import type { Matrix2 } from '@/lib/visualizers/generators/matrix-expo'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_EXP = 10

const LAB_FIELDS: LabField[] = [
  {
    id: 'exp',
    label: 'Exponentul (M^p, M = matricea Fibonacci)',
    placeholder: 'ex: 10',
    hint: 'Un întreg între 1 și 40',
    validate: raw => {
      const n = parseIntegers(raw)
      if (!n || n.length !== 1) return 'Un singur număr.'
      if (n[0] < 1 || n[0] > 40) return 'Între 1 și 40.'
      return null
    },
  },
]

function MatrixBox({
  label,
  m,
  tone,
}: {
  label: string
  m: Matrix2
  tone: 'result' | 'base'
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="font-mono text-[11px] text-muted-foreground">{label}</span>
      <div
        className={cn(
          'grid grid-cols-2 gap-1 rounded-[10px] border-2 p-2',
          tone === 'result'
            ? 'border-success/50 bg-success/5'
            : 'border-primary/40 bg-accent/40',
        )}
      >
        {m.flat().map((v, i) => (
          <div
            key={i}
            className={cn(
              'flex h-10 w-12 items-center justify-center rounded-[6px] font-mono text-sm font-semibold tabular-nums',
              tone === 'result' ? 'text-success' : 'text-primary',
            )}
          >
            {v}
          </div>
        ))}
      </div>
    </div>
  )
}

export function MatrixExpoVisualizer() {
  const [exp, setExp] = useState(DEFAULT_EXP)
  const frames = useMemo(() => generateMatrixExpo({ exponent: exp }), [exp])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [exp, reset])

  const s = player.currentFrame.state
  const bits = s.exponent.toString(2).split('')
  // current bit position from the right = number of shifts done
  const shifted = s.exponent.toString(2).length - s.remaining.toString(2).length

  function handleLabSubmit(v: Record<string, string>) {
    const n = parseIntegers(v.exp ?? '')
    if (n && n.length === 1 && n[0] >= 1 && n[0] <= 40) setExp(n[0])
  }

  return (
    <VisualizerShell
      title="Ridicare la putere a matricelor (exponențiere rapidă)"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-4 py-2">
        {/* exponent in binary */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-muted-foreground">
            {s.exponent} =
          </span>
          <div className="flex gap-1">
            {bits.map((b, i) => {
              const posFromRight = bits.length - 1 - i
              const isCurrent =
                s.phase === 'step' && posFromRight === shifted - 1
              return (
                <span
                  key={i}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-[5px] border-2 font-mono text-xs font-bold tabular-nums transition-all duration-200',
                    isCurrent
                      ? 'scale-110 border-primary bg-accent text-primary'
                      : b === '1'
                        ? 'border-primary/30 bg-primary/10 text-foreground'
                        : 'border-border bg-muted text-muted-foreground',
                  )}
                >
                  {b}
                </span>
              )
            })}
            <span className="ml-1 self-center font-mono text-[11px] text-muted-foreground">
              ₂
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <MatrixBox label="rezultat" m={s.result} tone="result" />
          <span className="font-mono text-lg text-muted-foreground">×?</span>
          <MatrixBox label="bază (se ridică la pătrat)" m={s.base} tone="base" />
        </div>

        {s.done && (
          <div className="flex items-center gap-2 rounded-[10px] border border-success/40 bg-success/10 px-4 py-1.5">
            <span className="font-mono text-xs text-muted-foreground">
              Fib({s.exponent}) =
            </span>
            <span className="font-mono text-lg font-bold tabular-nums text-success">
              {s.result[0][1]}
            </span>
          </div>
        )}
      </div>
    </VisualizerShell>
  )
}
