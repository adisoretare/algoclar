'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateModularClock } from '@/lib/visualizers/generators/modular-clock'
import type { ModularClockOp } from '@/lib/visualizers/generators/modular-clock'
import { VisualizerShell } from './VisualizerShell'
import { LabInput } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_A = 7
const DEFAULT_B = 5
const DEFAULT_M = 12

/** Pixel radius of the circle on which dial cells are placed. */
const RADIUS = 92

const OPS: { id: ModularClockOp; label: string }[] = [
  { id: 'rest', label: 'rest' },
  { id: 'adunare', label: 'adunare' },
  { id: 'scadere', label: 'scădere' },
  { id: 'inmultire', label: 'înmulțire' },
]

function parseInteger(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed || !/^-?\d+$/.test(trimmed)) return null
  return parseInt(trimmed, 10)
}

const LAB_FIELDS: LabField[] = [
  {
    id: 'a',
    label: 'a',
    placeholder: 'ex: 7',
    defaultValue: String(DEFAULT_A),
    hint: 'Număr întreg între 0 și 1000',
    validate: raw => {
      const n = parseInteger(raw)
      if (n === null) return 'Introdu un număr întreg.'
      if (n < 0 || n > 1000) return 'a trebuie să fie între 0 și 1000.'
      return null
    },
  },
  {
    id: 'b',
    label: 'b (neutilizat la „rest”)',
    placeholder: 'ex: 5',
    defaultValue: String(DEFAULT_B),
    hint: 'Număr întreg între 0 și 1000 · ignorat pentru operația „rest”',
    validate: raw => {
      const n = parseInteger(raw)
      if (n === null) return 'Introdu un număr întreg.'
      if (n < 0 || n > 1000) return 'b trebuie să fie între 0 și 1000.'
      return null
    },
  },
  {
    id: 'm',
    label: 'm (mărimea cadranului)',
    placeholder: 'ex: 12',
    defaultValue: String(DEFAULT_M),
    hint: 'Număr întreg între 2 și 24',
    validate: raw => {
      const n = parseInteger(raw)
      if (n === null) return 'Introdu un număr întreg.'
      if (n < 2 || n > 24) return 'm trebuie să fie între 2 și 24.'
      return null
    },
  },
]

interface ModularClockVisualizerProps {
  initialOp?: ModularClockOp
}

export function ModularClockVisualizer({
  initialOp = 'adunare',
}: ModularClockVisualizerProps) {
  const [a, setA] = useState(DEFAULT_A)
  const [b, setB] = useState(DEFAULT_B)
  const [m, setM] = useState(DEFAULT_M)
  const [op, setOp] = useState<ModularClockOp>(initialOp)

  const frames = useMemo(
    () => generateModularClock({ a, b, m, op }),
    [a, b, m, op],
  )
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [a, b, m, op, reset])

  const { position, value, result, done } = player.currentFrame.state
  const dialM = player.currentFrame.state.m

  function handleLabSubmit(values: Record<string, string>) {
    const na = parseInteger(values.a ?? '')
    const nb = parseInteger(values.b ?? '')
    const nm = parseInteger(values.m ?? '')
    if (na === null || nb === null || nm === null) return
    setA(na)
    setB(nb)
    setM(nm)
  }

  return (
    <VisualizerShell
      title="Aritmetică modulară — ceasul cu rest"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-5 py-2">
        {/* Op tabs */}
        <div
          className="flex max-w-full flex-wrap justify-center gap-2"
          role="tablist"
          aria-label="Operație modulară"
        >
          {OPS.map(o => {
            const active = o.id === op
            return (
              <button
                key={o.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setOp(o.id)}
                className={cn(
                  'rounded-[8px] border px-3 py-1.5 font-mono text-xs font-semibold transition-colors',
                  active
                    ? 'border-primary bg-accent text-primary'
                    : 'border-border bg-muted text-muted-foreground hover:text-foreground',
                )}
              >
                {o.label}
              </button>
            )
          })}
        </div>

        {/* Clock dial */}
        <div
          className="relative"
          style={{ width: RADIUS * 2 + 48, height: RADIUS * 2 + 48 }}
          role="list"
          aria-label={`Cadran modular de mărime ${dialM}`}
        >
          {Array.from({ length: dialM }, (_, i) => {
            // Place position i around the circle, 0 at the top, clockwise.
            const angle = (i / dialM) * 2 * Math.PI - Math.PI / 2
            const cx = RADIUS + 24 + Math.cos(angle) * RADIUS
            const cy = RADIUS + 24 + Math.sin(angle) * RADIUS
            const isCurrent = i === position
            return (
              <div
                key={i}
                role="listitem"
                aria-current={isCurrent ? 'true' : undefined}
                aria-label={`Poziția ${i}${isCurrent ? ', curentă' : ''}`}
                className={cn(
                  'absolute flex h-9 w-9 items-center justify-center rounded-full border-2 font-mono text-xs font-semibold tabular-nums transition-all duration-200',
                  isCurrent
                    ? 'scale-110 border-primary bg-accent text-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]'
                    : 'border-border bg-muted text-muted-foreground',
                )}
                style={{
                  left: cx,
                  top: cy,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {i}
              </div>
            )
          })}

          {/* Center readout */}
          <div
            className="absolute left-1/2 top-1/2 flex max-w-[7rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            aria-hidden
          >
            <span className="font-mono text-[10px] text-muted-foreground">
              valoare
            </span>
            <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
              {value}
            </span>
          </div>
        </div>

        {/* Result box */}
        {done && result >= 0 && (
          <div
            role="status"
            className="rounded-[10px] border border-success bg-success/15 px-4 py-2 text-center font-mono text-sm font-semibold text-success"
          >
            rezultat = {result}
          </div>
        )}
      </div>
    </VisualizerShell>
  )
}

export function ModularClockRest() {
  return <ModularClockVisualizer initialOp="rest" />
}

export function ModularClockAdunare() {
  return <ModularClockVisualizer initialOp="adunare" />
}

export function ModularClockScadere() {
  return <ModularClockVisualizer initialOp="scadere" />
}

export function ModularClockInmultire() {
  return <ModularClockVisualizer initialOp="inmultire" />
}
