'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateSieve } from '@/lib/visualizers/generators/sieve'
import { VisualizerShell } from './VisualizerShell'
import { LabInput } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_N = 30

const LAB_FIELDS: LabField[] = [
  {
    id: 'n',
    label: 'Limita n',
    placeholder: 'ex: 30',
    defaultValue: '30',
    hint: 'Un singur întreg · între 2 și 120',
    validate: raw => {
      const trimmed = raw.trim()
      if (!/^-?\d+$/.test(trimmed)) return 'Introdu un singur număr întreg.'
      const n = parseInt(trimmed, 10)
      if (n < 2) return 'n trebuie să fie cel puțin 2.'
      if (n > 120) return 'n trebuie să fie cel mult 120.'
      return null
    },
  },
]

export function SieveVisualizer() {
  const [n, setN] = useState(DEFAULT_N)
  const frames = useMemo(() => generateSieve({ n }), [n])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [n, reset])

  const { statuses, p, multiple, primes, done } = player.currentFrame.state

  function handleLabSubmit(values: Record<string, string>) {
    const parsed = parseInt((values.n ?? '').trim(), 10)
    if (!Number.isNaN(parsed) && parsed >= 2 && parsed <= 120) setN(parsed)
  }

  return (
    <VisualizerShell
      title="Ciurul lui Eratostene — toate primele până la n"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-6 py-2">
        {/* Grila de numere 2..n */}
        <div
          className="flex flex-wrap justify-center gap-1.5"
          role="list"
          aria-label={`Numerele de la 2 la ${n}`}
        >
          {statuses.map((status, value) => {
            if (value < 2) return null

            const isCurrentPrime = value === p
            const isCrossingNow = value === multiple
            const isConfirmedPrime = status === 'prime' && !isCurrentPrime
            const isComposite = status === 'composite' && !isCrossingNow

            const stateLabel = isCurrentPrime
              ? ', prim curent'
              : isCrossingNow
                ? ', se taie acum'
                : status === 'prime'
                  ? ', prim'
                  : status === 'composite'
                    ? ', compus'
                    : ''

            return (
              <div
                key={value}
                role="listitem"
                aria-label={`${value}${stateLabel}`}
                aria-current={
                  isCurrentPrime || isCrossingNow ? 'true' : undefined
                }
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-[8px] border-2 font-mono text-sm font-semibold tabular-nums transition-all duration-200',
                  isCurrentPrime
                    ? 'scale-110 border-primary bg-accent text-primary'
                    : isCrossingNow
                      ? 'border-destructive bg-destructive/15 text-destructive'
                      : isConfirmedPrime
                        ? 'border-success bg-success/15 text-success'
                        : isComposite
                          ? 'border-border bg-muted/40 text-muted-foreground line-through'
                          : 'border-border bg-muted text-foreground',
                )}
              >
                {value}
              </div>
            )
          })}
        </div>

        {/* Chip-uri: primul curent + numărul de prime găsite */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div
            className={cn(
              'flex min-w-[110px] flex-col items-center rounded-[10px] border px-4 py-2 transition-all duration-300',
              p >= 0 ? 'border-primary/40 bg-accent' : 'border-border bg-muted/50',
            )}
          >
            <span className="font-mono text-xs text-muted-foreground">
              prim curent p
            </span>
            <span className="font-mono text-xl font-bold tabular-nums text-primary">
              {p >= 0 ? p : '—'}
            </span>
          </div>
          <div className="flex min-w-[110px] flex-col items-center rounded-[10px] border border-success/40 bg-success/10 px-4 py-2">
            <span className="font-mono text-xs text-muted-foreground">
              prime găsite
            </span>
            <span className="font-mono text-xl font-bold tabular-nums text-success">
              {primes.length}
            </span>
          </div>
        </div>

        {/* Lista primelor găsite */}
        {primes.length > 0 && (
          <div className="flex w-full flex-col items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {done ? 'numere prime' : 'prime confirmate până acum'}
            </span>
            <div
              className="flex flex-wrap justify-center gap-1.5"
              role="list"
              aria-label="Numere prime găsite"
            >
              {primes.map(prime => (
                <span
                  key={prime}
                  role="listitem"
                  aria-label={`prim ${prime}`}
                  className="rounded-full border border-success/40 bg-success/15 px-2.5 py-0.5 font-mono text-xs font-semibold tabular-nums text-success"
                >
                  {prime}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </VisualizerShell>
  )
}
