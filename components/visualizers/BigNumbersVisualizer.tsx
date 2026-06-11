'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateBigNumbers } from '@/lib/visualizers/generators/big-numbers'
import { VisualizerShell } from './VisualizerShell'
import type { LabField } from './LabInput'
import { LabInput } from './LabInput'

const DEFAULT_A = '4825'
const DEFAULT_B = '1996'

function toDigits(s: string): number[] {
  return s.split('').map(Number)
}

const LAB_FIELDS: LabField[] = [
  {
    id: 'numbers',
    label: 'Două numere (separate prin spațiu)',
    placeholder: 'ex: 4825 1996',
    defaultValue: '4825 1996',
    hint: 'Doar cifre · max 18 cifre fiecare',
    validate: raw => {
      const parts = raw.trim().split(/\s+/)
      if (parts.length !== 2) return 'Introdu exact două numere.'
      if (parts.some(p => !/^\d+$/.test(p))) return 'Doar cifre.'
      if (parts.some(p => p.length > 18)) return 'Maximum 18 cifre per număr.'
      return null
    },
  },
]

export function BigNumbersVisualizer() {
  const [a, setA] = useState(DEFAULT_A)
  const [b, setB] = useState(DEFAULT_B)
  const frames = useMemo(
    () => generateBigNumbers({ a: toDigits(a), b: toDigits(b) }),
    [a, b],
  )
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [a, b, reset])

  const s = player.currentFrame.state
  const width = Math.max(s.a.length, s.b.length, s.result.length)

  // Build right-aligned rows of fixed width; null = empty cell.
  const pad = (digits: readonly number[]) => {
    const arr: (number | null)[] = new Array(width - digits.length).fill(null)
    return [...arr, ...digits]
  }
  const aRow = pad(s.a)
  const bRow = pad(s.b)
  const resultRow = pad(s.result)
  // visual column index of the active position (pos counts from the right)
  const activeCol = s.pos >= 0 ? width - 1 - s.pos : -1

  function handleLabSubmit(v: Record<string, string>) {
    const parts = (v.numbers ?? '').trim().split(/\s+/)
    if (parts.length === 2 && parts.every(p => /^\d+$/.test(p) && p.length <= 18)) {
      setA(parts[0])
      setB(parts[1])
    }
  }

  const cell = (value: number | null, active: boolean, tone: 'a' | 'b' | 'r') => (
    <div
      className={cn(
        'flex h-10 w-9 items-center justify-center rounded-[6px] border-2 font-mono text-base font-semibold tabular-nums transition-all duration-200',
        active
          ? 'scale-110 border-primary bg-accent text-primary'
          : value === null
            ? 'border-transparent bg-transparent'
            : tone === 'r'
              ? 'border-success/40 bg-success/5 text-success'
              : 'border-border bg-muted text-foreground',
      )}
    >
      {value === null ? '' : value}
    </div>
  )

  return (
    <VisualizerShell
      title="Numere mari — adunare cifră cu cifră"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-2 py-2">
        {/* Carry row */}
        <div className="flex gap-1">
          {Array.from({ length: width }, (_, c) => {
            const showCarry = s.carry > 0 && c === activeCol - 1
            return (
              <div
                key={c}
                className="flex h-5 w-9 items-center justify-center font-mono text-[11px] font-bold text-warning"
              >
                {showCarry ? `+${s.carry}` : ''}
              </div>
            )
          })}
        </div>

        {/* A */}
        <div className="flex gap-1">
          {aRow.map((v, c) => (
            <div key={c}>{cell(v, c === activeCol, 'a')}</div>
          ))}
        </div>
        {/* B with plus sign */}
        <div className="flex items-center gap-1">
          {bRow.map((v, c) => (
            <div key={c}>{cell(v, c === activeCol, 'b')}</div>
          ))}
        </div>
        <div className="h-0.5 w-full max-w-full rounded-full bg-border" />
        {/* Result */}
        <div className="flex gap-1">
          {resultRow.map((v, c) => (
            <div key={c}>{cell(v, false, 'r')}</div>
          ))}
        </div>

        {s.digitSum !== null && s.pos >= 0 && (
          <span className="mt-1 font-mono text-[11px] text-muted-foreground">
            coloana curentă: sumă {s.digitSum} → cifră {s.digitSum % 10}
            {s.carry > 0 ? `, report ${s.carry}` : ''}
          </span>
        )}
      </div>
    </VisualizerShell>
  )
}
