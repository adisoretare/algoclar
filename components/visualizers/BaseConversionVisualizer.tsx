'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { VisualizerShell } from './VisualizerShell'
import { generateBaseConversion } from '@/lib/visualizers/generators/base-conversion'
import { LabInput } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_VALUE = 45
const DEFAULT_BASE = 2

const LAB_FIELDS: LabField[] = [
  {
    id: 'value',
    label: 'Numărul (baza 10)',
    placeholder: 'ex: 45',
    defaultValue: '45',
    hint: 'Întreg între 0 și 1.000.000.000',
    validate: raw => {
      const trimmed = raw.trim()
      if (!/^\d+$/.test(trimmed))
        return 'Introdu un întreg nenegativ.'
      const n = Number(trimmed)
      if (!Number.isInteger(n)) return 'Introdu un întreg valid.'
      if (n < 0) return 'Numărul trebuie să fie cel puțin 0.'
      if (n > 1e9) return 'Numărul trebuie să fie cel mult 1.000.000.000.'
      return null
    },
  },
  {
    id: 'base',
    label: 'Baza țintă',
    placeholder: 'ex: 2',
    defaultValue: '2',
    hint: 'Întreg între 2 și 16',
    validate: raw => {
      const trimmed = raw.trim()
      if (!/^\d+$/.test(trimmed)) return 'Introdu un întreg.'
      const n = Number(trimmed)
      if (!Number.isInteger(n)) return 'Introdu un întreg valid.'
      if (n < 2) return 'Baza trebuie să fie cel puțin 2.'
      if (n > 16) return 'Baza trebuie să fie cel mult 16.'
      return null
    },
  },
]

export function BaseConversionVisualizer() {
  const [value, setValue] = useState(DEFAULT_VALUE)
  const [base, setBase] = useState(DEFAULT_BASE)

  const frames = useMemo(
    () => generateBaseConversion({ value, base }),
    [value, base],
  )
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [value, base, reset])

  const state = player.currentFrame.state
  const { steps, current, digits, result, done } = state

  function handleLabSubmit(values: Record<string, string>) {
    const v = Number((values.value ?? '').trim())
    const b = Number((values.base ?? '').trim())
    if (Number.isInteger(v) && Number.isInteger(b)) {
      setValue(v)
      setBase(b)
    }
  }

  return (
    <VisualizerShell
      title={`Conversie baza 10 → baza ${base} (împărțiri succesive)`}
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-6 py-2">
        <div className="font-mono text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{value}</span>
          <sub>(10)</sub> → baza{' '}
          <span className="font-semibold text-foreground">{base}</span>
        </div>

        {/* Tabel de împărțiri */}
        <div
          className="w-full max-w-md overflow-hidden rounded-[10px] border border-border"
          role="table"
          aria-label="Pașii împărțirilor succesive"
        >
          <div
            className="grid grid-cols-[1fr_auto_1fr_auto] gap-x-2 border-b border-border bg-muted/50 px-3 py-2 font-mono text-xs text-muted-foreground"
            role="row"
          >
            <span role="columnheader">v</span>
            <span role="columnheader" className="text-center">
              ÷ {base} =
            </span>
            <span role="columnheader">cât</span>
            <span role="columnheader" className="text-right">
              rest
            </span>
          </div>
          {steps.length === 0 ? (
            <div className="px-3 py-3 font-mono text-xs text-muted-foreground">
              Niciun pas încă — pornește playerul.
            </div>
          ) : (
            steps.map((step, i) => {
              const isCurrent = !done && step.v === current
              return (
                <div
                  key={i}
                  role="row"
                  className={cn(
                    'grid grid-cols-[1fr_auto_1fr_auto] items-center gap-x-2 border-b border-border px-3 py-2 font-mono text-sm last:border-b-0 transition-colors duration-200',
                    isCurrent
                      ? 'border-primary bg-accent text-foreground'
                      : 'text-muted-foreground',
                  )}
                  aria-current={isCurrent ? 'true' : undefined}
                >
                  <span role="cell" className="font-semibold text-foreground">
                    {step.v}
                  </span>
                  <span role="cell" className="text-center text-muted-foreground">
                    ÷ {base} =
                  </span>
                  <span role="cell">{step.quotient}</span>
                  <span
                    role="cell"
                    className="text-right font-semibold text-primary"
                    aria-label={`rest ${step.remainder}, cifra ${step.digit}`}
                  >
                    {step.digit}
                  </span>
                </div>
              )
            })
          )}
        </div>

        {/* Resturile colectate (ordinea producerii) */}
        {digits.length > 0 && (
          <div className="flex flex-col items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {done
                ? 'Resturi — se citesc de jos în sus'
                : 'Resturi colectate (în ordinea producerii)'}
            </span>
            <div
              className="flex flex-wrap justify-center gap-1.5"
              role="list"
              aria-label="Resturile colectate"
            >
              {digits.map((d, i) => (
                <div
                  key={i}
                  role="listitem"
                  className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-border bg-muted font-mono text-sm font-semibold text-foreground"
                  aria-label={`cifra ${d}, poziția ${i + 1}`}
                >
                  {d}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rezultatul final */}
        {done && result !== null && (
          <div className="flex flex-col items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              Reprezentarea în baza {base}
            </span>
            <div
              className="flex items-center gap-3 rounded-[10px] border border-success/40 bg-success/10 px-5 py-3"
              role="status"
            >
              <div
                className="flex flex-wrap justify-center gap-1.5"
                role="list"
                aria-label={`Rezultat ${result} în baza ${base}`}
              >
                {result.split('').map((d, i) => (
                  <div
                    key={i}
                    role="listitem"
                    className="flex h-10 w-10 items-center justify-center rounded-[8px] border-2 border-success bg-success/15 font-mono text-lg font-bold text-success"
                    aria-label={`cifra ${d}`}
                  >
                    {d}
                  </div>
                ))}
              </div>
              <span className="font-mono text-sm font-semibold text-success">
                ({base})
              </span>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {value}
              <sub>(10)</sub> = {result}
              <sub>({base})</sub>
            </span>
          </div>
        )}
      </div>
    </VisualizerShell>
  )
}
