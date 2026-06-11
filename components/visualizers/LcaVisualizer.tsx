'use client'

import { useMemo, useEffect, useState } from 'react'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateLca } from '@/lib/visualizers/generators/lca'
import { layeredTreeLayout } from '@/lib/visualizers/graph-layout'
import { VisualizerShell } from './VisualizerShell'
import { GraphCanvas } from './GraphCanvas'
import type { GCNode, GCEdge, GraphTone } from './GraphCanvas'
import { LabInput, parseIntegers } from './LabInput'
import type { LabField } from './LabInput'

//          0
//        / | \
//       1  2  ...
const PARENT = [0, 0, 0, 1, 1, 2, 4, 4]
const ROOT = 0
const DEFAULT_U = 6
const DEFAULT_V = 3

const children: number[][] = Array.from({ length: PARENT.length }, () => [])
PARENT.forEach((par, i) => {
  if (i !== ROOT) children[par].push(i)
})

const LAB_FIELDS: LabField[] = [
  {
    id: 'query',
    label: 'Două noduri u v',
    placeholder: 'ex: 6 3',
    hint: `Noduri între 0 și ${PARENT.length - 1}`,
    validate: raw => {
      const nums = parseIntegers(raw)
      if (!nums || nums.length !== 2) return 'Introdu exact două noduri.'
      if (nums.some(x => x < 0 || x >= PARENT.length))
        return `Noduri între 0 și ${PARENT.length - 1}.`
      return null
    },
  },
]

export function LcaVisualizer() {
  const [u, setU] = useState(DEFAULT_U)
  const [v, setV] = useState(DEFAULT_V)
  const layout = useMemo(
    () => layeredTreeLayout(PARENT.length, ROOT, children),
    [],
  )
  const frames = useMemo(
    () => generateLca({ parent: PARENT, root: ROOT, u, v }),
    [u, v],
  )
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [u, v, reset])

  const s = player.currentFrame.state

  function handleLabSubmit(vals: Record<string, string>) {
    const nums = parseIntegers(vals.query ?? '')
    if (nums && nums.length === 2 && nums.every(x => x >= 0 && x < PARENT.length)) {
      setU(nums[0])
      setV(nums[1])
    }
  }

  const nodeTone = (id: number): GraphTone => {
    if (s.done && id === s.lca) return 'path'
    if (id === s.pu || id === s.pv) return 'active'
    if (id === s.u || id === s.v) return 'frontier'
    return 'idle'
  }

  const nodes: GCNode[] = layout.map(p => ({
    id: p.id,
    x: p.x,
    y: p.y,
    label: String(p.id),
    sub: `h${s.depth[p.id]}`,
    tone: nodeTone(p.id),
  }))

  const edges: GCEdge[] = []
  for (let i = 0; i < s.n; i++) {
    if (i !== ROOT) edges.push({ from: i, to: s.parent[i], tone: 'idle' })
  }

  return (
    <VisualizerShell
      title="LCA — cel mai apropiat strămoș comun"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-3 py-2">
        <GraphCanvas nodes={nodes} edges={edges} />
        <div className="flex flex-wrap items-center justify-center gap-x-4 font-mono text-xs text-muted-foreground">
          <span>
            întrebare:{' '}
            <span className="font-semibold text-warning">
              LCA({s.u}, {s.v})
            </span>
          </span>
          {s.lca !== null && (
            <span>
              răspuns:{' '}
              <span className="font-semibold text-success">{s.lca}</span>
            </span>
          )}
        </div>
      </div>
    </VisualizerShell>
  )
}
