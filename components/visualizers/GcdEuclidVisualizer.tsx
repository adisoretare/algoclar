'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { VisualizerShell } from './VisualizerShell'
import { generateGcdEuclid } from '@/lib/visualizers/generators/gcd-euclid'
import { LabInput } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_A = 48
const DEFAULT_B = 18

function validatePositive(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return 'Introdu un număr întreg.'
  if (!/^\d+$/.test(trimmed)) return 'Introdu un număr întreg pozitiv.'
  const n = parseInt(trimmed, 10)
  if (isNaN(n)) return 'Introdu un număr întreg.'
  if (n < 1) return 'Valoarea trebuie să fie cel puțin 1.'
  if (n > 1_000_000) return 'Valoarea trebuie să fie cel mult 1.000.000.'
  return null
}

const LAB_FIELDS: LabField[] = [
  {
    id: 'a',
    label: 'Primul număr (a)',
    placeholder: 'ex: 48',
    defaultValue: String(DEFAULT_A),
    hint: 'Număr întreg · între 1 și 1.000.000',
    validate: validatePositive,
  },
  {
    id: 'b',
    label: 'Al doilea număr (b)',
    placeholder: 'ex: 18',
    defaultValue: String(DEFAULT_B),
    hint: 'Număr întreg · între 1 și 1.000.000',
    validate: validatePositive,
  },
]

export function GcdEuclidVisualizer() {
  const [a, setA] = useState(DEFAULT_A)
  const [b, setB] = useState(DEFAULT_B)
  const frames = useMemo(() => generateGcdEuclid({ a, b }), [a, b])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [a, b, reset])

  const { a: curA, b: curB, r, history, gcd, done } = player.currentFrame.state

  function handleLabSubmit(values: Record<string, string>) {
    const na = parseInt((values.a ?? '').trim(), 10)
    const nb = parseInt((values.b ?? '').trim(), 10)
    if (!isNaN(na) && !isNaN(nb)) {
      setA(na)
      setB(nb)
    }
  }

  return (
    <VisualizerShell
      title="Algoritmul lui Euclid — CMMDC"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-6 py-2">
        {/* Current pair + remainder chips */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <StatChip label="a" value={curA} emphasized={!done} />
          <StatChip label="b" value={done ? 0 : curB} emphasized={!done} />
          <StatChip
            label="r = a % b"
            value={done ? '—' : r}
            emphasized={!done}
          />
        </div>

        {/* Steps table */}
        <div className="w-full max-w-md overflow-hidden rounded-[10px] border border-border">
          <table className="w-full border-collapse font-mono text-sm">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground">
                <th className="px-3 py-2 text-left font-medium">a</th>
                <th className="px-3 py-2 text-left font-medium">b</th>
                <th className="px-3 py-2 text-left font-medium">r = a % b</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, i) => {
                const isCurrent = !done && i === history.length - 1
                return (
                  <tr
                    key={i}
                    aria-current={isCurrent ? 'true' : undefined}
                    className={cn(
                      'border-t border-border transition-colors',
                      isCurrent
                        ? 'border-primary bg-accent text-foreground'
                        : 'text-muted-foreground',
                    )}
                  >
                    <td className="px-3 py-1.5 tabular-nums">{row.a}</td>
                    <td className="px-3 py-1.5 tabular-nums">{row.b}</td>
                    <td className="px-3 py-1.5 tabular-nums">{row.r}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Final result */}
        {done && (
          <div
            role="status"
            className="rounded-[10px] border border-success bg-success/10 px-5 py-3 text-center"
          >
            <span className="font-mono text-xs text-muted-foreground">
              CMMDC
            </span>
            <div className="font-mono text-2xl font-bold tabular-nums text-success">
              {gcd}
            </div>
          </div>
        )}
      </div>
    </VisualizerShell>
  )
}

interface StatChipProps {
  label: string
  value: number | string
  emphasized: boolean
}

function StatChip({ label, value, emphasized }: StatChipProps) {
  return (
    <div
      className={cn(
        'flex min-w-[96px] flex-col items-center rounded-[10px] border px-4 py-2 transition-all duration-300',
        emphasized
          ? 'border-primary/40 bg-accent'
          : 'border-border bg-muted/50',
      )}
    >
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          'font-mono text-xl font-bold tabular-nums transition-all duration-200',
          emphasized ? 'text-primary' : 'text-foreground',
        )}
      >
        {value}
      </span>
    </div>
  )
}
