'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateGeometryBasics } from '@/lib/visualizers/generators/geometry-basics'
import type { Point } from '@/lib/visualizers/generators/geometry-basics'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_POINTS: [Point, Point, Point] = [
  { x: 1, y: 1, label: 'A' },
  { x: 6, y: 3, label: 'B' },
  { x: 2, y: 5, label: 'C' },
]

function parsePoints(raw: string): [Point, Point, Point] | null {
  const parts = raw.split(';').map(s => s.trim()).filter(Boolean)
  if (parts.length !== 3) return null
  const labels = ['A', 'B', 'C']
  const pts: Point[] = []
  for (let i = 0; i < 3; i++) {
    const nums = parseIntegers(parts[i])
    if (!nums || nums.length !== 2) return null
    if (nums.some(n => n < 0 || n > 12)) return null
    pts.push({ x: nums[0], y: nums[1], label: labels[i] })
  }
  return pts as [Point, Point, Point]
}

const LAB_FIELDS: LabField[] = [
  {
    id: 'points',
    label: 'Trei puncte: x y (separate prin ;)',
    placeholder: 'ex: 1 1 ; 6 3 ; 2 5',
    hint: 'Coordonate întregi între 0 și 12',
    validate: raw => {
      const p = parsePoints(raw)
      if (!p) return 'Trei puncte „x y”, coordonate 0–12, separate prin ;.'
      return null
    },
  },
]

const SIZE = 300
const PAD = 28

export function GeometryVisualizer() {
  const [points, setPoints] = useState<[Point, Point, Point]>(DEFAULT_POINTS)
  const frames = useMemo(() => generateGeometryBasics({ points }), [points])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [points, reset])

  const s = player.currentFrame.state

  const { minX, maxX, minY, maxY } = useMemo(() => {
    const xs = points.map(p => p.x)
    const ys = points.map(p => p.y)
    return {
      minX: Math.min(...xs, 0),
      maxX: Math.max(...xs) + 1,
      minY: Math.min(...ys, 0),
      maxY: Math.max(...ys) + 1,
    }
  }, [points])

  const spanX = Math.max(1, maxX - minX)
  const spanY = Math.max(1, maxY - minY)
  const sx = (x: number) => PAD + ((x - minX) / spanX) * (SIZE - 2 * PAD)
  const sy = (y: number) => SIZE - PAD - ((y - minY) / spanY) * (SIZE - 2 * PAD)

  function handleLabSubmit(v: Record<string, string>) {
    const p = parsePoints(v.points ?? '')
    if (p) setPoints(p)
  }

  const [A, B, C] = s.points

  return (
    <VisualizerShell
      title="Geometrie — puncte, distanță și arie"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-3 py-2">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="h-[300px] w-[300px] rounded-[10px] border border-border bg-muted/30"
          role="img"
          aria-label="Plan cartezian cu punctele A, B, C"
        >
          {/* axes */}
          <line x1={sx(minX)} y1={sy(0)} x2={sx(maxX)} y2={sy(0)} stroke="hsl(var(--border))" strokeWidth={1.5} />
          <line x1={sx(0)} y1={sy(minY)} x2={sx(0)} y2={sy(maxY)} stroke="hsl(var(--border))" strokeWidth={1.5} />

          {/* triangle */}
          {s.triangle && (
            <polygon
              points={`${sx(A.x)},${sy(A.y)} ${sx(B.x)},${sy(B.y)} ${sx(C.x)},${sy(C.y)}`}
              fill="hsl(var(--success) / 0.15)"
              stroke="hsl(var(--success))"
              strokeWidth={2}
            />
          )}

          {/* segment */}
          {s.segment && (
            <line
              x1={sx(s.points[s.segment[0]].x)}
              y1={sy(s.points[s.segment[0]].y)}
              x2={sx(s.points[s.segment[1]].x)}
              y2={sy(s.points[s.segment[1]].y)}
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
            />
          )}

          {/* points */}
          {s.points.map((p, i) => {
            const hl = s.highlight.includes(i)
            return (
              <g key={i}>
                <circle
                  cx={sx(p.x)}
                  cy={sy(p.y)}
                  r={hl ? 6 : 4.5}
                  fill={hl ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                />
                <text
                  x={sx(p.x) + 8}
                  y={sy(p.y) - 8}
                  className="font-mono"
                  fontSize={13}
                  fontWeight={700}
                  fill="hsl(var(--foreground))"
                >
                  {p.label}({p.x},{p.y})
                </text>
              </g>
            )
          })}
        </svg>

        {s.result && (
          <div
            className={cn(
              'flex items-center gap-2 rounded-[10px] border px-4 py-2',
              'border-success/40 bg-success/10',
            )}
          >
            <span className="font-mono text-xs text-muted-foreground">
              {s.result.kind === 'distance' ? `distanța ${A.label}${B.label} ≈` : 'aria triunghiului ='}
            </span>
            <span className="font-mono text-xl font-bold tabular-nums text-success">
              {s.result.value}
            </span>
          </div>
        )}
      </div>
    </VisualizerShell>
  )
}
