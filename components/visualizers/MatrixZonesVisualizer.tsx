'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateMatrixZones } from '@/lib/visualizers/generators/matrix-zones'
import type { Zone } from '@/lib/visualizers/generators/matrix-zones'
import { VisualizerShell } from './VisualizerShell'
import { LabInput } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_N = 5

/**
 * Distinct, token-only look for each zone (no hardcoded colors).
 * Each zone uses a different token hue so the seven regions are clearly
 * tellable apart by both border and fill: the two diagonals are the strong
 * primary/secondary accents, the four triangles each get their own hue
 * (success / warning / destructive / muted), and the center is neutral muted.
 */
const ZONE_STYLE: Record<Zone, string> = {
  principala: 'border-primary bg-primary/20 text-primary',
  secundara: 'border-secondary bg-secondary/20 text-secondary',
  nord: 'border-success bg-success/15 text-success',
  est: 'border-warning bg-warning/20 text-warning',
  sud: 'border-destructive bg-destructive/15 text-destructive',
  vest: 'border-accent-foreground bg-accent text-accent-foreground',
  centru: 'border-muted-foreground bg-muted text-muted-foreground',
}

/** Romanian name for each zone, used in legend + aria labels. */
const ZONE_LABEL: Record<Zone, string> = {
  principala: 'Diagonala principală',
  secundara: 'Diagonala secundară',
  nord: 'Zona de nord (sus)',
  est: 'Zona de est (dreapta)',
  sud: 'Zona de sud (jos)',
  vest: 'Zona de vest (stânga)',
  centru: 'Centru',
}

const UNREVEALED_STYLE = 'border-border bg-muted/30 text-muted-foreground/50'

const LAB_FIELDS: LabField[] = [
  {
    id: 'n',
    label: 'Dimensiunea matricei n (între 2 și 9)',
    placeholder: 'ex: 5',
    defaultValue: String(DEFAULT_N),
    hint: 'Matrice pătratică n×n',
    validate: raw => {
      const trimmed = raw.trim()
      if (!/^\d+$/.test(trimmed)) return 'Introdu un număr întreg.'
      const n = parseInt(trimmed, 10)
      if (n < 2 || n > 9) return 'n trebuie să fie între 2 și 9.'
      return null
    },
  },
]

export function MatrixZonesVisualizer() {
  const [n, setN] = useState<number>(DEFAULT_N)

  const frames = useMemo(() => generateMatrixZones({ n }), [n])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [n, reset])

  const { grid } = player.currentFrame.state

  function handleLabSubmit(values: Record<string, string>) {
    const trimmed = (values.n ?? '').trim()
    if (!/^\d+$/.test(trimmed)) return
    const next = parseInt(trimmed, 10)
    if (next < 2 || next > 9) return
    setN(next)
  }

  // Legend lists only the zones that actually occur in this matrix, in a
  // fixed canonical order. Small matrices (e.g. 2×2) have no triangular zones,
  // so we must not list zones that have no cells.
  const ZONE_ORDER: Zone[] = [
    'principala',
    'secundara',
    'nord',
    'est',
    'sud',
    'vest',
    'centru',
  ]
  const presentZones = new Set<Zone>(
    grid.flatMap(row => row.map(cell => cell.zone)),
  )
  const legendZones: Zone[] = ZONE_ORDER.filter(z => presentZones.has(z))

  return (
    <VisualizerShell
      title="Zone determinate de diagonale într-o matrice pătratică"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-6 py-2 sm:flex-row sm:items-start sm:justify-center sm:gap-10">
        {/* Matrix */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            matrice {n}×{n}
          </span>
          <div className="flex max-w-full flex-col gap-1 overflow-x-auto">
            {grid.map((row, i) => (
              <div key={i} className="flex gap-1">
                {row.map((cell, j) => (
                  <div
                    key={j}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-[6px] border-2 font-mono text-xs font-semibold tabular-nums transition-all duration-200',
                      cell.revealed
                        ? ZONE_STYLE[cell.zone]
                        : UNREVEALED_STYLE,
                    )}
                    aria-label={
                      cell.revealed
                        ? `celula (${i},${j}), ${ZONE_LABEL[cell.zone]}`
                        : `celula (${i},${j}), zonă neafișată încă`
                    }
                  >
                    {cell.value}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col items-start gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            legendă
          </span>
          <ul className="flex max-w-[16rem] flex-wrap gap-x-4 gap-y-1.5 sm:flex-col sm:flex-nowrap">
            {legendZones.map(zone => (
              <li key={zone} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={cn(
                    'h-5 w-5 shrink-0 rounded-[4px] border-2',
                    ZONE_STYLE[zone],
                  )}
                />
                <span className="font-mono text-xs text-foreground">
                  {ZONE_LABEL[zone]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </VisualizerShell>
  )
}
