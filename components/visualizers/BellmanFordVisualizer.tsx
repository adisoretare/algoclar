'use client'

import { useMemo, useEffect, useState } from 'react'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateBellmanFord } from '@/lib/visualizers/generators/bellman-ford'
import type { Graph } from '@/lib/visualizers/generators/graph-types'
import { circularLayout } from '@/lib/visualizers/graph-layout'
import { VisualizerShell } from './VisualizerShell'
import { GraphCanvas } from './GraphCanvas'
import type { GCNode, GCEdge, GraphTone } from './GraphCanvas'
import { LabInput } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_GRAPH: Graph = {
  n: 5,
  directed: true,
  edges: [
    { from: 0, to: 1, weight: 6 },
    { from: 0, to: 2, weight: 7 },
    { from: 1, to: 2, weight: 8 },
    { from: 1, to: 3, weight: 5 },
    { from: 1, to: 4, weight: -4 },
    { from: 2, to: 3, weight: -3 },
    { from: 2, to: 4, weight: 9 },
    { from: 3, to: 1, weight: -2 },
    { from: 4, to: 0, weight: 2 },
    { from: 4, to: 3, weight: 7 },
  ],
}

const LAB_FIELDS: LabField[] = [
  {
    id: 'edges',
    label: 'Arce „u v cost" (separate prin ;)',
    placeholder: 'ex: 0 1 6 ; 1 4 -4',
    hint: 'Graf orientat · ponderile pot fi negative · noduri de la 0',
    validate: raw => {
      // allow negative weights: parse manually tolerant to '-'
      const rows = raw.split(';').map(s => s.trim()).filter(Boolean)
      if (rows.length === 0) return 'Introdu cel puțin un arc.'
      for (const r of rows) {
        const parts = r.split(/\s+/).map(Number)
        if (parts.length !== 3 || parts.some(Number.isNaN))
          return 'Fiecare arc: „u v cost".'
        if (parts[0] < 0 || parts[1] < 0) return 'Nodurile trebuie să fie ≥ 0.'
      }
      return null
    },
  },
]

function parseSigned(raw: string): Graph | null {
  const rows = raw.split(';').map(s => s.trim()).filter(Boolean)
  if (rows.length === 0) return null
  const edges: Graph['edges'] = []
  let maxId = 0
  for (const r of rows) {
    const p = r.split(/\s+/).map(Number)
    if (p.length !== 3 || p.some(Number.isNaN) || p[0] < 0 || p[1] < 0)
      return null
    edges.push({ from: p[0], to: p[1], weight: p[2] })
    maxId = Math.max(maxId, p[0], p[1])
  }
  return { n: maxId + 1, edges, directed: true }
}

export function BellmanFordVisualizer() {
  const [graph, setGraph] = useState<Graph>(DEFAULT_GRAPH)
  const layout = useMemo(() => circularLayout(graph.n), [graph.n])
  const frames = useMemo(
    () => generateBellmanFord({ graph, source: 0 }),
    [graph],
  )
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [graph, reset])

  const s = player.currentFrame.state

  function handleLabSubmit(v: Record<string, string>) {
    const g = parseSigned(v.edges ?? '')
    if (g && g.n <= 9) setGraph(g)
  }

  const nodes: GCNode[] = layout.map(p => ({
    id: p.id,
    x: p.x,
    y: p.y,
    label: String(p.id),
    sub: s.dist[p.id] !== null ? `${s.dist[p.id]}` : '∞',
    tone:
      s.dist[p.id] !== null ? ('visited' as GraphTone) : ('idle' as GraphTone),
  }))

  const edges: GCEdge[] = s.edges.map(e => {
    const active =
      s.activeEdge !== null &&
      s.activeEdge[0] === e.from &&
      s.activeEdge[1] === e.to
    const tone: GraphTone = active ? 'path' : 'idle'
    return { from: e.from, to: e.to, weight: e.weight, directed: true, tone }
  })

  return (
    <VisualizerShell
      title="Bellman-Ford — drumuri minime cu costuri negative"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-3 py-2">
        <GraphCanvas nodes={nodes} edges={edges} />
        <div className="flex flex-wrap items-center justify-center gap-x-4 font-mono text-xs text-muted-foreground">
          <span>
            iterația{' '}
            <span className="font-semibold text-foreground">
              {s.iteration}
            </span>{' '}
            / {s.n - 1}
          </span>
          {s.negativeCycle && (
            <span className="font-semibold text-destructive">
              ciclu negativ detectat!
            </span>
          )}
        </div>
      </div>
    </VisualizerShell>
  )
}
