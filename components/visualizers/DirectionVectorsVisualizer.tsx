'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateDirectionVectors } from '@/lib/visualizers/generators/direction-vectors'
import type { Connectivity } from '@/lib/visualizers/generators/direction-vectors'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_ROWS = 4
const DEFAULT_COLS = 5
const DEFAULT_CELL = { r: 1, c: 2 }

const MODES: { id: Connectivity; label: string }[] = [
  { id: 4, label: '4 vecini' },
  { id: 8, label: '8 vecini' },
]

function fmtSigned(n: number): string {
  return `${n < 0 ? '−' : ''}${Math.abs(n)}`
}

interface DirectionVectorsVisualizerProps {
  initialConnectivity?: Connectivity
}

export function DirectionVectorsVisualizer({
  initialConnectivity = 8,
}: DirectionVectorsVisualizerProps) {
  const [rows, setRows] = useState(DEFAULT_ROWS)
  const [cols, setCols] = useState(DEFAULT_COLS)
  const [cell, setCell] = useState<{ r: number; c: number }>(DEFAULT_CELL)
  const [connectivity, setConnectivity] =
    useState<Connectivity>(initialConnectivity)

  const frames = useMemo(
    () => generateDirectionVectors({ rows, cols, cell, connectivity }),
    [rows, cols, cell, connectivity],
  )
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [rows, cols, cell, connectivity, reset])

  const state = player.currentFrame.state
  const { dirIndex, neighbors, done } = state

  // Direction arrays for the chip strip (full set for this connectivity).
  const dirArrays = useMemo(() => {
    if (connectivity === 4) {
      return { dr: [-1, 0, 1, 0], dc: [0, 1, 0, -1] }
    }
    return {
      dr: [-1, -1, 0, 1, 1, 1, 0, -1],
      dc: [0, 1, 1, 1, 0, -1, -1, -1],
    }
  }, [connectivity])

  // Map of valid, already-tested neighbor cells → their direction index.
  const validNeighborKeys = useMemo(() => {
    const map = new Map<string, number>()
    neighbors.forEach((n, i) => {
      if (n.valid) map.set(`${n.nr}:${n.nc}`, i)
    })
    return map
  }, [neighbors])

  // The neighbor currently being tested (matches dirIndex), if any.
  const currentNeighbor =
    dirIndex >= 0 && dirIndex < neighbors.length ? neighbors[dirIndex] : null

  // Out-of-bounds attempts accumulated so far (no cell to render in-grid).
  const rejected = neighbors.filter(n => !n.valid)

  function handleLabSubmit(values: Record<string, string>) {
    const r = parseInt(values.rows ?? '', 10)
    const c = parseInt(values.cols ?? '', 10)
    const cn2 = parseIntegers(values.cell ?? '')
    if (isNaN(r) || isNaN(c) || !cn2 || cn2.length !== 2) return
    if (r < 1 || c < 1 || r > 8 || c > 8) return
    const [cr, cc] = cn2
    if (cr < 0 || cc < 0 || cr >= r || cc >= c) return
    setRows(r)
    setCols(c)
    setCell({ r: cr, c: cc })
  }

  const LAB_FIELDS: LabField[] = [
    {
      id: 'rows',
      label: 'Linii (1–8)',
      placeholder: 'ex: 4',
      defaultValue: String(DEFAULT_ROWS),
      validate: raw => {
        const n = parseInt(raw.trim(), 10)
        if (isNaN(n)) return 'Introdu un număr întreg.'
        if (n < 1 || n > 8) return 'Numărul de linii trebuie să fie între 1 și 8.'
        return null
      },
    },
    {
      id: 'cols',
      label: 'Coloane (1–8)',
      placeholder: 'ex: 5',
      defaultValue: String(DEFAULT_COLS),
      validate: raw => {
        const n = parseInt(raw.trim(), 10)
        if (isNaN(n)) return 'Introdu un număr întreg.'
        if (n < 1 || n > 8) return 'Numărul de coloane trebuie să fie între 1 și 8.'
        return null
      },
    },
    {
      id: 'cell',
      label: 'Celula curentă: r c (0-indexat)',
      placeholder: 'ex: 1 2',
      defaultValue: `${DEFAULT_CELL.r} ${DEFAULT_CELL.c}`,
      hint: 'Două numere: linia și coloana celulei',
      validate: raw => {
        const nums = parseIntegers(raw)
        if (!nums || nums.length !== 2) return 'Introdu exact 2 numere.'
        if (nums[0] < 0 || nums[1] < 0) return 'Coordonatele nu pot fi negative.'
        return null
      },
    },
  ]

  function crossValidateCell(values: Record<string, string>): string | null {
    const r = parseInt(values.rows ?? '', 10)
    const c = parseInt(values.cols ?? '', 10)
    const nums = parseIntegers(values.cell ?? '')
    if (isNaN(r) || isNaN(c) || !nums || nums.length !== 2) return null
    const [cr, cc] = nums
    if (cr >= r || cc >= c)
      return `Celula iese din matrice: r ≤ ${r - 1}, c ≤ ${c - 1}.`
    return null
  }

  return (
    <VisualizerShell
      title="Vectori de direcție — vecinii unei celule în matrice"
      player={player}
      frameCount={frames.length}
      labZone={
        <LabInput
          fields={LAB_FIELDS}
          onSubmit={handleLabSubmit}
          crossValidate={crossValidateCell}
        />
      }
    >
      <div className="flex flex-col items-center gap-5 py-2">
        {/* Connectivity toggle */}
        <div
          className="flex flex-wrap justify-center gap-2"
          role="group"
          aria-label="Conectivitate"
        >
          {MODES.map(m => {
            const active = m.id === connectivity
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={active}
                aria-label={`Conectivitate ${m.label}`}
                onClick={() => setConnectivity(m.id)}
                className={cn(
                  'rounded-[8px] border px-3 py-1.5 font-mono text-xs font-semibold transition-colors',
                  active
                    ? 'border-primary bg-accent text-primary'
                    : 'border-border bg-muted text-muted-foreground hover:text-foreground',
                )}
              >
                {m.label}
              </button>
            )
          })}
        </div>

        {/* dr / dc chip strip */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            tablourile de direcție (dr, dc)
          </span>
          <div
            className="flex flex-wrap justify-center gap-1.5"
            role="list"
            aria-label="Direcții"
          >
            {dirArrays.dr.map((d, i) => {
              const active = i === dirIndex
              const tested = done || (dirIndex >= 0 && i < dirIndex)
              return (
                <span
                  key={i}
                  role="listitem"
                  className={cn(
                    'flex h-8 items-center justify-center rounded-[6px] border px-2 font-mono text-xs font-semibold tabular-nums transition-all duration-200',
                    active
                      ? 'scale-110 border-primary bg-accent text-primary ring-2 ring-ring'
                      : tested
                        ? 'border-border bg-muted text-foreground'
                        : 'border-border bg-muted/40 text-muted-foreground',
                  )}
                  aria-label={`direcția ${i}: dr=${d}, dc=${dirArrays.dc[i]}`}
                  aria-current={active ? 'true' : undefined}
                >
                  ({fmtSigned(d)}, {fmtSigned(dirArrays.dc[i])})
                </span>
              )
            })}
          </div>
        </div>

        {/* Grid */}
        <div
          className="flex max-w-full flex-col gap-1 overflow-x-auto"
          role="grid"
          aria-label={`Matrice ${rows}×${cols}`}
        >
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="flex gap-1">
              {Array.from({ length: cols }, (_, j) => {
                const isCenter = i === cell.r && j === cell.c
                const isCurrent =
                  currentNeighbor !== null &&
                  currentNeighbor.valid &&
                  currentNeighbor.nr === i &&
                  currentNeighbor.nc === j
                const isVisited = validNeighborKeys.has(`${i}:${j}`)
                return (
                  <div
                    key={j}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-[6px] border-2 font-mono text-xs font-semibold tabular-nums transition-all duration-200',
                      isCenter
                        ? 'border-primary bg-accent text-primary'
                        : isCurrent
                          ? 'scale-110 border-success bg-success/15 text-success ring-2 ring-ring'
                          : isVisited
                            ? 'border-success bg-success/15 text-success'
                            : 'border-border bg-muted text-muted-foreground',
                    )}
                    aria-label={
                      isCenter
                        ? `celula curentă (${i}, ${j})`
                        : isVisited
                          ? `vecin valid (${i}, ${j})`
                          : `celula (${i}, ${j})`
                    }
                    aria-current={isCenter ? 'true' : undefined}
                  >
                    {i},{j}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Rejected (out-of-bounds) chips */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            vecini respinși (în afara matricei)
          </span>
          <div
            className="flex min-h-[2rem] flex-wrap justify-center gap-1.5"
            role="list"
            aria-label="Vecini respinși"
          >
            {rejected.length === 0 ? (
              <span className="font-mono text-xs text-muted-foreground/60">
                —
              </span>
            ) : (
              rejected.map((n, i) => (
                <span
                  key={i}
                  role="listitem"
                  className="flex h-8 items-center justify-center rounded-[6px] border border-destructive bg-destructive/15 px-2 font-mono text-xs font-semibold tabular-nums text-destructive"
                  aria-label={`vecin respins: dr=${n.dr}, dc=${n.dc}, ținta (${n.nr}, ${n.nc})`}
                >
                  ({fmtSigned(n.dr)}, {fmtSigned(n.dc)}) → ({n.nr}, {n.nc}) ✗
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </VisualizerShell>
  )
}

export function DirectionVectors4() {
  return <DirectionVectorsVisualizer initialConnectivity={4} />
}

export function DirectionVectors8() {
  return <DirectionVectorsVisualizer initialConnectivity={8} />
}
