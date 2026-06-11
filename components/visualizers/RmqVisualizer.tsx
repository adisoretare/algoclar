'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateRmq } from '@/lib/visualizers/generators/rmq'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_ARRAY = [5, 2, 8, 1, 9, 3, 7, 4]
const DEFAULT_L = 1
const DEFAULT_R = 6

const LAB_FIELDS: LabField[] = [
  {
    id: 'array',
    label: 'Vectorul tău',
    placeholder: 'ex: 5 2 8 1 9 3',
    hint: 'Întregi separați prin spațiu · min 2 · max 12',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums) return 'Introdu numere întregi.'
      if (nums.length < 2 || nums.length > 12) return 'Între 2 și 12 valori.'
      return null
    },
  },
  {
    id: 'range',
    label: 'Intervalul [l, r] (0-indexat)',
    placeholder: 'ex: 1 6',
    hint: 'Două numere cu 0 ≤ l ≤ r',
    validate: raw => {
      const n = parseIntegers(raw)
      if (!n || n.length !== 2 || n[0] < 0 || n[1] < n[0])
        return 'Două numere cu 0 ≤ l ≤ r.'
      return null
    },
  },
]

export function RmqVisualizer() {
  const [array, setArray] = useState(DEFAULT_ARRAY)
  const [l, setL] = useState(DEFAULT_L)
  const [r, setR] = useState(DEFAULT_R)
  const frames = useMemo(
    () =>
      generateRmq({
        array,
        l: Math.min(l, array.length - 1),
        r: Math.min(r, array.length - 1),
      }),
    [array, l, r],
  )
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [array, l, r, reset])

  const s = player.currentFrame.state
  const n = s.array.length
  const queryCells = new Set(s.queryCells.map(([k, i]) => `${k},${i}`))
  const [ql, qr] = s.queryRange ?? [-1, -1]

  function handleLabSubmit(v: Record<string, string>) {
    const nums = parseIntegers(v.array ?? '')
    const rng = parseIntegers(v.range ?? '')
    if (nums) setArray(nums)
    if (rng && rng.length === 2 && rng[0] >= 0 && rng[1] >= rng[0]) {
      setL(rng[0])
      setR(rng[1])
    }
  }

  return (
    <VisualizerShell
      title="RMQ — minim pe interval cu Sparse Table"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-3 py-2">
        {/* array */}
        <div className="flex gap-1">
          {s.array.map((value, i) => (
            <div
              key={i}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-[6px] border-2 font-mono text-xs font-semibold tabular-nums',
                s.phase !== 'build' && i >= ql && i <= qr
                  ? 'border-warning bg-warning/10 text-warning'
                  : 'border-border bg-muted text-foreground',
              )}
            >
              {value}
            </div>
          ))}
        </div>
        {/* sparse table */}
        <table className="border-separate border-spacing-1">
          <tbody>
            {s.sparse.map((row, k) => (
              <tr key={k}>
                <th className="pr-1 text-right font-mono text-[10px] text-muted-foreground">
                  2^{k}
                </th>
                {row.map((value, i) => {
                  if (i + (1 << k) > n) {
                    return <td key={i} className="h-8 w-8" />
                  }
                  const isBuild = s.phase === 'build' && s.buildK === k && s.buildI === i
                  const isQuery = queryCells.has(`${k},${i}`)
                  return (
                    <td key={i}>
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-[6px] border-2 font-mono text-xs font-semibold tabular-nums transition-all duration-200',
                          isBuild
                            ? 'scale-110 border-primary bg-accent text-primary'
                            : isQuery
                              ? 'border-success bg-success/15 text-success'
                              : value === null
                                ? 'border-dashed border-border/50 text-muted-foreground/30'
                                : 'border-border bg-muted text-foreground',
                        )}
                      >
                        {value === null ? '' : value}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {s.result !== null && (
          <div className="flex items-center gap-2 rounded-[10px] border border-success/40 bg-success/10 px-4 py-1.5">
            <span className="font-mono text-xs text-muted-foreground">
              min[{ql}, {qr}] =
            </span>
            <span className="font-mono text-lg font-bold tabular-nums text-success">
              {s.result}
            </span>
          </div>
        )}
      </div>
    </VisualizerShell>
  )
}
