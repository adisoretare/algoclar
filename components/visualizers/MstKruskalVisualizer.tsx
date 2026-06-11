'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateMstKruskal } from '@/lib/visualizers/generators/mst-kruskal'
import type { Graph } from '@/lib/visualizers/generators/graph-types'
import { circularLayout } from '@/lib/visualizers/graph-layout'
import { parseEdgeList } from '@/lib/visualizers/parse-graph'
import { VisualizerShell } from './VisualizerShell'
import { GraphCanvas } from './GraphCanvas'
import type { GCNode, GCEdge, GraphTone } from './GraphCanvas'
import { LabInput } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_GRAPH: Graph = {
  n: 6,
  directed: false,
  edges: [
    { from: 0, to: 1, weight: 4 },
    { from: 0, to: 2, weight: 3 },
    { from: 1, to: 2, weight: 1 },
    { from: 1, to: 3, weight: 2 },
    { from: 2, to: 3, weight: 4 },
    { from: 3, to: 4, weight: 2 },
    { from: 4, to: 5, weight: 6 },
    { from: 2, to: 5, weight: 5 },
  ],
}

const LAB_FIELDS: LabField[] = [
  {
    id: 'edges',
    label: 'Muchii „u v cost" (separate prin ;)',
    placeholder: 'ex: 0 1 4 ; 1 2 1',
    defaultValue: '0 1 4 ; 0 2 3 ; 1 2 1 ; 1 3 2 ; 2 3 4 ; 3 4 2 ; 4 5 6 ; 2 5 5',
    hint: 'Graf neorientat ponderat · noduri de la 0',
    validate: raw => {
      const g = parseEdgeList(raw, { weighted: true, directed: false })
      if (!g) return 'Fiecare muchie: „u v cost", separate prin ;.'
      if (g.n > 9) return 'Maximum 9 noduri.'
      return null
    },
  },
]

const edgeKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`)

export function MstKruskalVisualizer() {
  const [graph, setGraph] = useState<Graph>(DEFAULT_GRAPH)
  const layout = useMemo(() => circularLayout(graph.n), [graph.n])
  const frames = useMemo(() => generateMstKruskal({ graph }), [graph])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [graph, reset])

  const s = player.currentFrame.state

  function handleLabSubmit(v: Record<string, string>) {
    const g = parseEdgeList(v.edges ?? '', { weighted: true, directed: false })
    if (g && g.n <= 9) setGraph(g)
  }

  const chosenKeys = new Set(
    s.sorted.filter((_, i) => s.chosen[i]).map(e => edgeKey(e.from, e.to)),
  )
  const activeKey =
    s.activeEdge !== null ? edgeKey(s.activeEdge[0], s.activeEdge[1]) : null

  const nodes: GCNode[] = layout.map(p => ({
    id: p.id,
    x: p.x,
    y: p.y,
    label: String(p.id),
    tone: 'idle' as GraphTone,
  }))

  const edges: GCEdge[] = s.edges.map(e => {
    const key = edgeKey(e.from, e.to)
    let tone: GraphTone = 'idle'
    if (chosenKeys.has(key)) tone = 'path'
    if (activeKey === key) tone = s.accepted ? 'path' : 'active'
    return { from: e.from, to: e.to, weight: e.weight, tone }
  })

  return (
    <VisualizerShell
      title="Kruskal — arbore parțial de cost minim"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-3 py-2">
        <GraphCanvas nodes={nodes} edges={edges} />
        <div className="flex flex-wrap justify-center gap-1.5">
          {s.sorted.map((e, i) => {
            const isActive =
              s.index === i && s.activeEdge !== null
            return (
              <span
                key={i}
                className={cn(
                  'rounded-[6px] border px-2 py-0.5 font-mono text-[11px] transition-colors',
                  isActive
                    ? s.accepted
                      ? 'border-success bg-success/15 text-success'
                      : 'border-destructive bg-destructive/10 text-destructive'
                    : s.chosen[i]
                      ? 'border-success/40 bg-success/5 text-success'
                      : 'border-border bg-muted text-muted-foreground',
                )}
              >
                {e.from}-{e.to}:{e.weight}
              </span>
            )
          })}
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          cost MST:{' '}
          <span className="font-semibold text-success">{s.mstWeight}</span>
        </span>
      </div>
    </VisualizerShell>
  )
}
