'use client'

import { useMemo, useEffect, useState } from 'react'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateDijkstra } from '@/lib/visualizers/generators/dijkstra'
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
  directed: true,
  edges: [
    { from: 0, to: 1, weight: 7 },
    { from: 0, to: 2, weight: 9 },
    { from: 0, to: 5, weight: 14 },
    { from: 1, to: 2, weight: 10 },
    { from: 1, to: 3, weight: 15 },
    { from: 2, to: 3, weight: 11 },
    { from: 2, to: 5, weight: 2 },
    { from: 3, to: 4, weight: 6 },
    { from: 5, to: 4, weight: 9 },
  ],
}

const LAB_FIELDS: LabField[] = [
  {
    id: 'edges',
    label: 'Arce „u v cost" (separate prin ;)',
    placeholder: 'ex: 0 1 7 ; 0 2 9',
    hint: 'Graf orientat · ponderi ≥ 0 · noduri de la 0',
    validate: raw => {
      const g = parseEdgeList(raw, { weighted: true, directed: true })
      if (!g) return 'Fiecare arc: „u v cost", separate prin ;.'
      if (g.n > 9) return 'Maximum 9 noduri.'
      if (g.edges.some(e => (e.weight ?? 0) < 0)) return 'Ponderi ≥ 0.'
      return null
    },
  },
]

export function DijkstraVisualizer() {
  const [graph, setGraph] = useState<Graph>(DEFAULT_GRAPH)
  const layout = useMemo(() => circularLayout(graph.n), [graph.n])
  const frames = useMemo(() => generateDijkstra({ graph, source: 0 }), [graph])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [graph, reset])

  const s = player.currentFrame.state

  function handleLabSubmit(v: Record<string, string>) {
    const g = parseEdgeList(v.edges ?? '', { weighted: true, directed: true })
    if (g && g.n <= 9 && g.edges.every(e => (e.weight ?? 0) >= 0)) setGraph(g)
  }

  const inPq = new Set(s.pq.map(x => x.node))
  const nodeTone = (id: number): GraphTone => {
    if (id === s.current) return 'active'
    if (s.visited[id]) return 'done'
    if (inPq.has(id)) return 'frontier'
    return 'idle'
  }

  const nodes: GCNode[] = layout.map(p => ({
    id: p.id,
    x: p.x,
    y: p.y,
    label: String(p.id),
    sub: s.dist[p.id] !== null ? `${s.dist[p.id]}` : '∞',
    tone: nodeTone(p.id),
  }))

  const edges: GCEdge[] = s.edges.map(e => {
    const active =
      s.activeEdge !== null &&
      s.activeEdge[0] === e.from &&
      s.activeEdge[1] === e.to
    const tone: GraphTone = active
      ? s.relaxed
        ? 'path'
        : 'active'
      : s.visited[e.from] && s.visited[e.to]
        ? 'visited'
        : 'idle'
    return { from: e.from, to: e.to, weight: e.weight, directed: true, tone }
  })

  return (
    <VisualizerShell
      title="Dijkstra — drumuri minime cu coadă de priorități"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-3 py-2">
        <GraphCanvas nodes={nodes} edges={edges} />
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <span>coadă de priorități:</span>
          <span className="font-semibold text-warning">
            [{s.pq.map(x => `${x.node}:${x.dist}`).join(', ') || '—'}]
          </span>
        </div>
      </div>
    </VisualizerShell>
  )
}
