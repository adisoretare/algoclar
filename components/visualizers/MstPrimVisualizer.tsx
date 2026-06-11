'use client'

import { useMemo, useEffect, useState } from 'react'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateMstPrim } from '@/lib/visualizers/generators/mst-prim'
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
    hint: 'Graf neorientat conex · noduri de la 0',
    validate: raw => {
      const g = parseEdgeList(raw, { weighted: true, directed: false })
      if (!g) return 'Fiecare muchie: „u v cost", separate prin ;.'
      if (g.n > 9) return 'Maximum 9 noduri.'
      return null
    },
  },
]

const edgeKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`)

export function MstPrimVisualizer() {
  const [graph, setGraph] = useState<Graph>(DEFAULT_GRAPH)
  const layout = useMemo(() => circularLayout(graph.n), [graph.n])
  const frames = useMemo(() => generateMstPrim({ graph, start: 0 }), [graph])
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

  const treeKeys = new Set<string>()
  for (let i = 0; i < s.n; i++) {
    if (s.inTree[i] && s.parent[i] !== null) {
      treeKeys.add(edgeKey(s.parent[i] as number, i))
    }
  }
  const activeKey =
    s.activeEdge !== null ? edgeKey(s.activeEdge[0], s.activeEdge[1]) : null

  const nodeTone = (id: number): GraphTone => {
    if (id === s.current) return 'active'
    if (s.inTree[id]) return 'done'
    if (s.key[id] !== null) return 'frontier'
    return 'idle'
  }

  const nodes: GCNode[] = layout.map(p => ({
    id: p.id,
    x: p.x,
    y: p.y,
    label: String(p.id),
    sub:
      s.inTree[p.id] || s.key[p.id] === null
        ? undefined
        : `key=${s.key[p.id]}`,
    tone: nodeTone(p.id),
  }))

  const edges: GCEdge[] = s.edges.map(e => {
    const key = edgeKey(e.from, e.to)
    let tone: GraphTone = 'idle'
    if (treeKeys.has(key)) tone = 'path'
    if (activeKey === key) tone = 'active'
    return { from: e.from, to: e.to, weight: e.weight, tone }
  })

  return (
    <VisualizerShell
      title="Prim — MST crescut dintr-un singur arbore"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-3 py-2">
        <GraphCanvas nodes={nodes} edges={edges} />
        <span className="font-mono text-xs text-muted-foreground">
          cost MST:{' '}
          <span className="font-semibold text-success">{s.mstWeight}</span>
        </span>
      </div>
    </VisualizerShell>
  )
}
