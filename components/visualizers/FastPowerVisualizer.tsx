'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateFastPower } from '@/lib/visualizers/generators/fast-power'
import { VisualizerShell } from './VisualizerShell'
import type { LabField } from './LabInput'
import { LabInput } from './LabInput'

const DEFAULT_BASE = 3
const DEFAULT_EXP = 13
const DEFAULT_MOD = 0

const LAB_FIELDS: LabField[] = [
  {
    id: 'base',
    label: 'Baza',
    placeholder: 'ex: 3',
    defaultValue: '3',
    hint: 'Număr întreg · între 0 și 1000',
    validate: raw => {
      const trimmed = raw.trim()
      if (!/^\d+$/.test(trimmed)) return 'Introdu un număr întreg pozitiv.'
      const n = parseInt(trimmed, 10)
      if (n < 0 || n > 1000) return 'Baza trebuie să fie între 0 și 1000.'
      return null
    },
  },
  {
    id: 'exp',
    label: 'Exponent',
    placeholder: 'ex: 13',
    defaultValue: '13',
    hint: 'Număr întreg · între 0 și 30',
    validate: raw => {
      const trimmed = raw.trim()
      if (!/^\d+$/.test(trimmed)) return 'Introdu un număr întreg nenegativ.'
      const n = parseInt(trimmed, 10)
      if (n < 0) return 'Exponentul nu poate fi negativ.'
      if (n > 30) return 'Exponentul trebuie să fie cel mult 30.'
      return null
    },
  },
  {
    id: 'mod',
    label: 'Modul (opțional)',
    placeholder: 'ex: 1000000007 · gol = fără modulo',
    defaultValue: '',
    hint: 'Lasă gol sau 0 pentru fără modulo · între 0 și 1.000.000.000',
    validate: raw => {
      const trimmed = raw.trim()
      if (trimmed === '') return null
      if (!/^\d+$/.test(trimmed)) return 'Introdu un număr întreg sau lasă gol.'
      const n = parseInt(trimmed, 10)
      if (n < 0 || n > 1_000_000_000)
        return 'Modulul trebuie să fie între 0 și 1.000.000.000.'
      return null
    },
  },
]

export function FastPowerVisualizer() {
  const [base, setBase] = useState(DEFAULT_BASE)
  const [exp, setExp] = useState(DEFAULT_EXP)
  const [mod, setMod] = useState(DEFAULT_MOD)

  const frames = useMemo(() => {
    try {
      return generateFastPower({ base, exp, mod })
    } catch {
      // Cădere sigură: cel puțin un frame ca să nu pice useStepPlayer.
      return generateFastPower({ base: DEFAULT_BASE, exp: DEFAULT_EXP, mod: 0 })
    }
  }, [base, exp, mod])

  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [base, exp, mod, reset])

  const s = player.currentFrame.state

  function handleLabSubmit(values: Record<string, string>) {
    const nextBase = parseInt((values.base ?? '').trim(), 10)
    const nextExp = parseInt((values.exp ?? '').trim(), 10)
    const rawMod = (values.mod ?? '').trim()
    const nextMod = rawMod === '' ? 0 : parseInt(rawMod, 10)
    if (Number.isNaN(nextBase) || Number.isNaN(nextExp) || Number.isNaN(nextMod))
      return
    // generateFastPower va valida din nou; prindem ca să nu blocăm UI-ul.
    try {
      generateFastPower({ base: nextBase, exp: nextExp, mod: nextMod })
    } catch {
      return
    }
    setBase(nextBase)
    setExp(nextExp)
    setMod(nextMod)
  }

  return (
    <VisualizerShell
      title="Exponențiere rapidă — ridicare la putere în O(log n)"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-6 py-2">
        {/* Antet: ce calculăm */}
        <div className="font-mono text-sm text-muted-foreground">
          calculăm{' '}
          <span className="font-semibold text-foreground">
            {s.base}
            <sup>{s.exp}</sup>
          </span>
          {s.mod > 0 && (
            <>
              {' '}
              mod{' '}
              <span className="font-semibold text-foreground">{s.mod}</span>
            </>
          )}
        </div>

        {/* Biții exponentului */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="flex flex-wrap justify-center gap-2"
            role="list"
            aria-label="Biții exponentului (de la cel mai semnificativ la cel mai puțin)"
          >
            {s.bits.map((bit, i) => {
              const isActive = i === s.activeBit
              const isOne = bit === 1
              return (
                <div
                  key={i}
                  role="listitem"
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-[10px] border-2 font-mono text-base font-semibold tabular-nums transition-all duration-200',
                      isActive
                        ? isOne
                          ? 'scale-110 border-success bg-success/10 text-success shadow-[0_0_0_4px_hsl(var(--success)/0.12)]'
                          : 'scale-110 border-muted-foreground bg-muted text-muted-foreground shadow-[0_0_0_4px_hsl(var(--muted-foreground)/0.10)]'
                        : isOne
                          ? 'border-success/40 bg-success/5 text-success'
                          : 'border-border bg-muted text-muted-foreground',
                    )}
                    aria-current={isActive ? 'true' : undefined}
                    aria-label={`bit ${i} = ${bit}${isActive ? ', procesat acum' : ''}`}
                  >
                    {bit}
                  </div>
                </div>
              )
            })}
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/60">
            exponentul în binar · MSB → LSB
          </span>
        </div>

        {/* Chip-uri: baza curentă și rezultat */}
        <div className="flex flex-wrap justify-center gap-3">
          <StatChip
            label="bază curentă (b)"
            value={s.b}
            tone="primary"
            emphasized={!s.done}
          />
          <StatChip
            label="rezultat"
            value={s.result}
            tone="success"
            emphasized={s.multiplied || s.done}
          />
          <StatChip
            label="e rămas"
            value={s.e}
            tone="muted"
            emphasized={false}
          />
        </div>

        {/* Indiciu pas curent */}
        {s.activeBit >= 0 && (
          <span className="font-mono text-[11px] text-muted-foreground">
            {s.multiplied
              ? 'bit = 1 → result ×= b, apoi b = b²'
              : 'bit = 0 → sărim înmulțirea, doar b = b²'}
          </span>
        )}
        {s.done && (
          <span className="font-mono text-[11px] text-success">
            rezultat final: {s.result}
          </span>
        )}
      </div>
    </VisualizerShell>
  )
}

interface StatChipProps {
  label: string
  value: number | string
  tone: 'primary' | 'success' | 'muted'
  emphasized: boolean
}

function StatChip({ label, value, tone, emphasized }: StatChipProps) {
  return (
    <div
      className={cn(
        'flex min-w-[120px] flex-col items-center rounded-[10px] border px-4 py-2 transition-all duration-300',
        emphasized
          ? tone === 'success'
            ? 'border-success/40 bg-success/10'
            : tone === 'primary'
              ? 'border-primary/40 bg-accent'
              : 'border-border bg-muted/50'
          : 'border-border bg-muted/50',
      )}
    >
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          'font-mono text-xl font-bold tabular-nums transition-all duration-200',
          tone === 'success'
            ? 'text-success'
            : tone === 'primary'
              ? 'text-primary'
              : 'text-foreground',
        )}
      >
        {value}
      </span>
    </div>
  )
}
