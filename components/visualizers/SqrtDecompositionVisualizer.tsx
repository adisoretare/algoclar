'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateSqrtDecomposition } from '@/lib/visualizers/generators/sqrt-decomposition'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_ARRAY = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8]
const DEFAULT_L = 2
const DEFAULT_R = 9

const LAB_FIELDS: LabField[] = [
  {
    id: 'array',
    label: 'Vectorul tău',
    placeholder: 'ex: 3 1 4 1 5 9 2 6 5',
    defaultValue: '3 1 4 1 5 9 2 6 5 3 5 8',
    hint: 'Întregi separați prin spațiu · min 4 · max 16',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums) return 'Introdu numere întregi.'
      if (nums.length < 4 || nums.length > 16) return 'Între 4 și 16 valori.'
      return null
    },
  },
  {
    id: 'range',
    label: 'Intervalul [l, r] (0-indexat)',
    placeholder: 'ex: 2 9',
    defaultValue: '2 9',
    hint: 'Două numere cu 0 ≤ l ≤ r',
    validate: raw => {
      const n = parseIntegers(raw)
      if (!n || n.length !== 2 || n[0] < 0 || n[1] < n[0])
        return 'Două numere cu 0 ≤ l ≤ r.'
      return null
    },
  },
]

function crossValidateRange(values: Record<string, string>): string | null {
  const nums = parseIntegers(values.array ?? '')
  const rng = parseIntegers(values.range ?? '')
  if (!nums || !rng || rng.length !== 2) return null
  if (rng[1] >= nums.length)
    return `Intervalul iese din vector: r ≤ ${nums.length - 1}.`
  return null
}

export function SqrtDecompositionVisualizer() {
  const [array, setArray] = useState(DEFAULT_ARRAY)
  const [l, setL] = useState(DEFAULT_L)
  const [r, setR] = useState(DEFAULT_R)
  const frames = useMemo(
    () =>
      generateSqrtDecomposition({
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
  const bs = s.blockSize
  const numBlocks = s.blockSum.length
  const coveredCells = new Set(s.coveredIndices)
  const coveredBlocks = new Set(s.coveredBlocks)
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
      title="Square Root Decomposition — interogări în O(√n)"
      player={player}
      frameCount={frames.length}
      labZone={
        <LabInput
          fields={LAB_FIELDS}
          onSubmit={handleLabSubmit}
          crossValidate={crossValidateRange}
        />
      }
    >
      <div className="flex flex-col items-center gap-3 py-2">
        {/* array grouped by block */}
        <div className="flex gap-2">
          {Array.from({ length: numBlocks }, (_, b) => (
            <div
              key={b}
              className={cn(
                'flex gap-1 rounded-[8px] border-2 p-1 transition-colors',
                s.currentKind === 'block' && s.current === b
                  ? 'border-primary'
                  : coveredBlocks.has(b)
                    ? 'border-success/50'
                    : 'border-border/40',
              )}
            >
              {s.array
                .slice(b * bs, Math.min((b + 1) * bs, s.array.length))
                .map((value, k) => {
                  const idx = b * bs + k
                  const inRange = s.phase !== 'build' && idx >= ql && idx <= qr
                  return (
                    <div
                      key={idx}
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-[5px] border font-mono text-xs font-semibold tabular-nums transition-all duration-200',
                        s.currentKind === 'cell' && s.current === idx
                          ? 'scale-110 border-primary bg-accent text-primary'
                          : coveredCells.has(idx)
                            ? 'border-success bg-success/15 text-success'
                            : inRange
                              ? 'border-warning/40 bg-warning/5 text-foreground'
                              : 'border-border bg-muted text-foreground',
                      )}
                    >
                      {value}
                    </div>
                  )
                })}
            </div>
          ))}
        </div>
        {/* block sums */}
        <div className="flex gap-2">
          {s.blockSum.map((sum, b) => (
            <div
              key={b}
              className={cn(
                'flex items-center justify-center rounded-[6px] border-2 px-2 py-1 font-mono text-xs font-semibold tabular-nums transition-colors',
                'min-w-[40px]',
                (s.currentKind === 'block' && s.current === b) ||
                  coveredBlocks.has(b)
                  ? 'border-success bg-success/15 text-success'
                  : 'border-border bg-muted/60 text-muted-foreground',
              )}
              style={{ width: bs * 32 + (bs - 1) * 4 + 8 }}
            >
              Σ={sum}
            </div>
          ))}
        </div>
        {s.accumulated !== null && (
          <div className="flex items-center gap-2 rounded-[10px] border border-success/40 bg-success/10 px-4 py-1.5">
            <span className="font-mono text-xs text-muted-foreground">
              sumă[{ql}, {qr}] =
            </span>
            <span className="font-mono text-lg font-bold tabular-nums text-success">
              {s.accumulated}
            </span>
          </div>
        )}
      </div>
    </VisualizerShell>
  )
}
