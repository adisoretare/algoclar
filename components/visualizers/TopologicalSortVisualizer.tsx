'use client'

import { useMemo, useEffect, useState } from 'react'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateTopologicalSort } from '@/lib/visualizers/generators/topological-sort'
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
    { from: 5, to: 2 },
    { from: 5, to: 0 },
    { from: 4, to: 0 },
    { from: 4, to: 1 },
    { from: 2, to: 3 },
    { from: 3, to: 1 },
  ],
}

const LAB_FIELDS: LabField[] = [
  {
    id: 'edges',
    label: 'Arce „u v" orientate (separate prin ;)',
    placeholder: 'ex: 5 2 ; 5 0 ; 2 3',
    hint: 'Graf orientat aciclic (DAG) · noduri de la 0',
    validate: raw => {
      const g = parseEdgeList(raw, { weighted: false, directed: true })
      if (!g) return 'Fiecare arc: „u v", separate prin ;.'
      if (g.n > 10) return 'Maximum 10 noduri.'
      return null
    },
  },
]

export function TopologicalSortVisualizer() {
  const [graph, setGraph] = useState<Graph>(DEFAULT_GRAPH)
  const layout = useMemo(() => circularLayout(graph.n), [graph.n])
  const frames = useMemo(() => generateTopologicalSort({ graph }), [graph])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [graph, reset])

  const s = player.currentFrame.state
  const orderPos = new Map(s.order.map((node, i) => [node, i]))

  function handleLabSubmit(v: Record<string, string>) {
    const g = parseEdgeList(v.edges ?? '', { weighted: false, directed: true })
    if (g && g.n <= 10) setGraph(g)
  }

  const nodeTone = (id: number): GraphTone => {
    if (id === s.current) return 'active'
    if (orderPos.has(id)) return 'done'
    if (s.queue.includes(id)) return 'frontier'
    return 'idle'
  }

  const nodes: GCNode[] = layout.map(p => ({
    id: p.id,
    x: p.x,
    y: p.y,
    label: String(p.id),
    sub: orderPos.has(p.id)
      ? `#${orderPos.get(p.id)! + 1}`
      : `in:${s.indeg[p.id]}`,
    tone: nodeTone(p.id),
  }))

  const edges: GCEdge[] = s.edges.map(e => {
    const active =
      s.activeEdge !== null &&
      s.activeEdge[0] === e.from &&
      s.activeEdge[1] === e.to
    const tone: GraphTone = active
      ? 'active'
      : orderPos.has(e.from)
        ? 'visited'
        : 'idle'
    return { from: e.from, to: e.to, directed: true, tone }
  })

  return (
    <VisualizerShell
      title="Sortare topologică — algoritmul lui Kahn"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-3 py-2">
        <GraphCanvas nodes={nodes} edges={edges} />
        <div className="flex flex-col items-center gap-1 font-mono text-xs text-muted-foreground">
          <span>
            coadă (grad 0):{' '}
            <span className="font-semibold text-warning">
              [{s.queue.join(', ')}]
            </span>
          </span>
          <span>
            ordine:{' '}
            <span className="font-semibold text-success">
              {s.order.join(' → ') || '—'}
            </span>
            {s.hasCycle && <span className="ml-2 text-destructive">ciclu!</span>}
          </span>
        </div>
      </div>
    </VisualizerShell>
  )
}
