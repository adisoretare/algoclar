'use client'

import { useMemo, useEffect, useState } from 'react'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateGraphDfs } from '@/lib/visualizers/generators/graph-dfs'
import type { Graph } from '@/lib/visualizers/generators/graph-types'
import { circularLayout } from '@/lib/visualizers/graph-layout'
import { parseEdgeList } from '@/lib/visualizers/parse-graph'
import { VisualizerShell } from './VisualizerShell'
import { GraphCanvas } from './GraphCanvas'
import type { GCNode, GCEdge, GraphTone } from './GraphCanvas'
import { LabInput } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_GRAPH: Graph = {
  n: 7,
  directed: false,
  edges: [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 4 },
    { from: 3, to: 5 },
    { from: 4, to: 5 },
    { from: 5, to: 6 },
  ],
}

const LAB_FIELDS: LabField[] = [
  {
    id: 'edges',
    label: 'Muchii „u v" (separate prin ;)',
    placeholder: 'ex: 0 1 ; 0 2 ; 1 3',
    hint: 'Graf neorientat · noduri de la 0',
    validate: raw => {
      const g = parseEdgeList(raw, { weighted: false, directed: false })
      if (!g) return 'Fiecare muchie: „u v", separate prin ;.'
      if (g.n > 10) return 'Maximum 10 noduri.'
      return null
    },
  },
]

export function GraphDfsVisualizer() {
  const [graph, setGraph] = useState<Graph>(DEFAULT_GRAPH)
  const layout = useMemo(() => circularLayout(graph.n), [graph.n])
  const frames = useMemo(() => generateGraphDfs({ graph, source: 0 }), [graph])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [graph, reset])

  const s = player.currentFrame.state

  function handleLabSubmit(v: Record<string, string>) {
    const g = parseEdgeList(v.edges ?? '', { weighted: false, directed: false })
    if (g && g.n <= 10) setGraph(g)
  }

  const nodeTone = (id: number): GraphTone => {
    if (id === s.current) return 'active'
    if (s.stack.includes(id)) return 'frontier'
    if (s.tin[id] !== null) return 'visited'
    return 'idle'
  }

  const nodes: GCNode[] = layout.map(p => ({
    id: p.id,
    x: p.x,
    y: p.y,
    label: String(p.id),
    sub:
      s.tin[p.id] !== null
        ? `${s.tin[p.id]}/${s.tout[p.id] ?? '·'}`
        : undefined,
    tone: nodeTone(p.id),
  }))

  const edges: GCEdge[] = s.edges.map(e => {
    const active =
      s.activeEdge !== null &&
      ((s.activeEdge[0] === e.from && s.activeEdge[1] === e.to) ||
        (s.activeEdge[0] === e.to && s.activeEdge[1] === e.from))
    const tone: GraphTone = active
      ? 'active'
      : s.tin[e.from] !== null && s.tin[e.to] !== null
        ? 'visited'
        : 'idle'
    return { from: e.from, to: e.to, tone }
  })

  return (
    <VisualizerShell
      title="DFS — parcurgere în adâncime, cu timpi tin/tout"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-3 py-2">
        <GraphCanvas nodes={nodes} edges={edges} />
        <div className="flex flex-wrap items-center justify-center gap-x-4 font-mono text-xs text-muted-foreground">
          <span>
            stivă de recursie:{' '}
            <span className="font-semibold text-warning">
              [{s.stack.join(', ')}]
            </span>
          </span>
          <span>sub fiecare nod: tin/tout</span>
        </div>
      </div>
    </VisualizerShell>
  )
}
