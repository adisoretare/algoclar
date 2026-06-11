'use client'

import { useMemo, useEffect, useState } from 'react'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateSegmentTree } from '@/lib/visualizers/generators/segment-tree'
import { layeredTreeLayout } from '@/lib/visualizers/graph-layout'
import { VisualizerShell } from './VisualizerShell'
import { GraphCanvas } from './GraphCanvas'
import type { GCNode, GCEdge, GraphTone } from './GraphCanvas'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_ARRAY = [3, 1, 4, 1, 5, 9, 2, 6]
const DEFAULT_L = 2
const DEFAULT_R = 6

const LAB_FIELDS: LabField[] = [
  {
    id: 'array',
    label: 'Vectorul tău',
    placeholder: 'ex: 3 1 4 1 5 9 2 6',
    defaultValue: '3 1 4 1 5 9 2 6',
    hint: 'Întregi separați prin spațiu · min 2 · max 8 valori',
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums) return 'Introdu numere întregi.'
      if (nums.length < 2 || nums.length > 8) return 'Între 2 și 8 valori.'
      return null
    },
  },
  {
    id: 'range',
    label: 'Intervalul [l, r] (0-indexat)',
    placeholder: 'ex: 2 6',
    defaultValue: '2 6',
    hint: 'Două numere: l și r',
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

export function SegmentTreeVisualizer() {
  const [array, setArray] = useState(DEFAULT_ARRAY)
  const [l, setL] = useState(DEFAULT_L)
  const [r, setR] = useState(DEFAULT_R)
  const frames = useMemo(
    () =>
      generateSegmentTree({
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
  const total = 2 * s.size

  const layout = useMemo(() => {
    const children: number[][] = Array.from({ length: total }, () => [])
    for (let i = 1; i < s.size; i++) {
      if (2 * i < total) children[i].push(2 * i)
      if (2 * i + 1 < total) children[i].push(2 * i + 1)
    }
    return layeredTreeLayout(total, 1, children, 340, 22, 24, 56)
  }, [total, s.size])

  function handleLabSubmit(v: Record<string, string>) {
    const nums = parseIntegers(v.array ?? '')
    const rng = parseIntegers(v.range ?? '')
    if (nums) setArray(nums)
    if (rng && rng.length === 2 && rng[0] >= 0 && rng[1] >= rng[0]) {
      setL(rng[0])
      setR(rng[1])
    }
  }

  const cover = new Set(s.coverNodes)
  const nodes: GCNode[] = []
  for (let i = 1; i < total; i++) {
    const p = layout[i]
    if (!p || s.tree[i] === null) continue
    const tone: GraphTone =
      i === s.current ? 'active' : cover.has(i) ? 'path' : 'idle'
    nodes.push({ id: i, x: p.x, y: p.y, label: String(s.tree[i]), tone })
  }

  const edges: GCEdge[] = []
  for (let i = 2; i < total; i++) {
    if (layout[i] && layout[i >> 1] && s.tree[i] !== null) {
      edges.push({ from: i, to: i >> 1, tone: 'idle' })
    }
  }

  return (
    <VisualizerShell
      title="Segment Tree — sume pe interval"
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
      <div className="flex flex-col items-center gap-2 py-2">
        <span className="font-mono text-xs font-semibold text-primary">
          {s.phase === 'build'
            ? 'construire (de jos în sus)'
            : s.phase === 'query'
              ? `interogare [${s.queryRange[0]}, ${s.queryRange[1]}]`
              : 'gata'}
        </span>
        <GraphCanvas nodes={nodes} edges={edges} nodeRadius={15} />
        {s.result !== null && (
          <div className="flex items-center gap-2 rounded-[10px] border border-success/40 bg-success/10 px-4 py-1.5">
            <span className="font-mono text-xs text-muted-foreground">sumă =</span>
            <span className="font-mono text-lg font-bold tabular-nums text-success">
              {s.result}
            </span>
          </div>
        )}
      </div>
    </VisualizerShell>
  )
}
