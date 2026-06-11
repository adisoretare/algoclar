'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generatePrefixSums } from '@/lib/visualizers/generators/prefix-sums'
import { VisualizerShell } from './VisualizerShell'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_ARRAY = [3, 1, 4, 1, 5, 9, 2, 6]
const DEFAULT_L = 2
const DEFAULT_R = 5

const LAB_FIELDS: LabField[] = [
  {
    id: 'array',
    label: 'Vectorul tău',
    placeholder: 'ex: 3 1 4 1 5 9 2',
    hint: 'Numere întregi separate prin spațiu · min 2 · max 12 valori',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums) return 'Introdu numere întregi separate prin spațiu.'
      if (nums.length < 2) return 'Introdu cel puțin 2 valori.'
      if (nums.length > 12) return 'Maximum 12 valori.'
      if (nums.some(n => n < -99 || n > 99))
        return 'Valorile trebuie să fie între -99 și 99.'
      return null
    },
  },
  {
    id: 'interval',
    label: 'Intervalul [l, r] (0-indexat)',
    placeholder: 'ex: 2 5',
    hint: 'Două numere: l și r, cu 0 ≤ l ≤ r < lungime',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums || nums.length !== 2) return 'Introdu exact două numere: l și r.'
      if (nums[0] < 0 || nums[1] < nums[0]) return 'Trebuie 0 ≤ l ≤ r.'
      return null
    },
  },
]

export function PrefixSumsVisualizer() {
  const [array, setArray] = useState(DEFAULT_ARRAY)
  const [l, setL] = useState(DEFAULT_L)
  const [r, setR] = useState(DEFAULT_R)

  const frames = useMemo(() => generatePrefixSums({ array, l, r }), [array, l, r])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [array, l, r, reset])

  const {
    prefix,
    phase,
    buildIndex,
    queryL,
    queryR,
    queryStage,
    result,
  } = player.currentFrame.state
  const currentArray = player.currentFrame.state.array

  function handleLabSubmit(values: Record<string, string>) {
    const nums = parseIntegers(values.array ?? '')
    const iv = parseIntegers(values.interval ?? '')
    if (!nums || !iv || iv.length !== 2) return
    const [nl, nr] = iv
    if (nl < 0 || nr >= nums.length || nl > nr) return
    setArray(nums)
    setL(nl)
    setR(nr)
  }

  const inQuery = phase === 'query' || phase === 'done'

  return (
    <VisualizerShell
      title="Sume parțiale — sumă pe interval în O(1)"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-7 py-2">
        {/* Source array */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">v</span>
          <div className="flex flex-wrap justify-center gap-1.5" role="list">
            {currentArray.map((value, i) => {
              const buildingThis = phase === 'build' && buildIndex === i + 1
              const inRange = inQuery && i >= queryL && i <= queryR
              return (
                <div
                  key={i}
                  role="listitem"
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-[8px] border-2 font-mono text-sm font-semibold transition-all duration-200',
                      buildingThis
                        ? 'scale-110 border-primary bg-accent text-primary'
                        : inRange
                          ? 'border-success bg-success/10 text-success'
                          : 'border-border bg-muted text-foreground',
                    )}
                    aria-label={`v[${i}] = ${value}`}
                  >
                    {value}
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    [{i}]
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Prefix array (n+1) */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            prefix (n+1 poziții)
          </span>
          <div className="flex flex-wrap justify-center gap-1.5" role="list">
            {prefix.map((value, i) => {
              const buildingThis = phase === 'build' && buildIndex === i
              const isRTerm = inQuery && queryStage >= 1 && i === queryR + 1
              const isLTerm = inQuery && queryStage >= 2 && i === queryL
              return (
                <div
                  key={i}
                  role="listitem"
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-[8px] border-2 font-mono text-sm font-semibold tabular-nums transition-all duration-200',
                      buildingThis
                        ? 'scale-110 border-primary bg-accent text-primary'
                        : isRTerm
                          ? 'border-success bg-success/15 text-success'
                          : isLTerm
                            ? 'border-warning bg-warning/15 text-warning'
                            : 'border-border bg-muted text-foreground',
                    )}
                    aria-label={`prefix[${i}] = ${value}`}
                  >
                    {value}
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    [{i}]
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Result */}
        {inQuery && queryStage >= 3 && result !== null && (
          <div className="flex items-center gap-2 rounded-[10px] border border-success/40 bg-success/10 px-4 py-2">
            <span className="font-mono text-xs text-muted-foreground">
              S({queryL}, {queryR}) =
            </span>
            <span className="font-mono text-xl font-bold tabular-nums text-success">
              {result}
            </span>
          </div>
        )}
      </div>
    </VisualizerShell>
  )
}
