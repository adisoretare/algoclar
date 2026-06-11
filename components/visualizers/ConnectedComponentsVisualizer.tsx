'use client'

import { useMemo, useEffect, useState } from 'react'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateConnectedComponents } from '@/lib/visualizers/generators/connected-components'
import type { Graph } from '@/lib/visualizers/generators/graph-types'
import { circularLayout } from '@/lib/visualizers/graph-layout'
import { parseEdgeList } from '@/lib/visualizers/parse-graph'
import { VisualizerShell } from './VisualizerShell'
import { GraphCanvas } from './GraphCanvas'
import type { GCNode, GCEdge, GraphTone } from './GraphCanvas'
import { LabInput } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_GRAPH: Graph = {
  n: 8,
  directed: false,
  edges: [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 0, to: 2 },
    { from: 3, to: 4 },
    { from: 5, to: 6 },
    { from: 6, to: 7 },
  ],
}

// distinct tones to tell components apart visually
const COMP_TONES: GraphTone[] = ['visited', 'path', 'frontier', 'done', 'source']

const LAB_FIELDS: LabField[] = [
  {
    id: 'edges',
    label: 'Muchii „u v" (separate prin ;)',
    placeholder: 'ex: 0 1 ; 1 2 ; 3 4',
    hint: 'Graf neorientat · nodurile fără muchii sunt componente separate',
    validate: raw => {
      const g = parseEdgeList(raw, { weighted: false, directed: false })
      if (!g) return 'Fiecare muchie: „u v", separate prin ;.'
      if (g.n > 12) return 'Maximum 12 noduri.'
      return null
    },
  },
]

export function ConnectedComponentsVisualizer() {
  const [graph, setGraph] = useState<Graph>(DEFAULT_GRAPH)
  const layout = useMemo(() => circularLayout(graph.n), [graph.n])
  const frames = useMemo(
    () => generateConnectedComponents({ graph }),
    [graph],
  )
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [graph, reset])

  const s = player.currentFrame.state

  function handleLabSubmit(v: Record<string, string>) {
    const g = parseEdgeList(v.edges ?? '', { weighted: false, directed: false })
    if (g && g.n <= 12) setGraph(g)
  }

  const nodeTone = (id: number): GraphTone => {
    if (id === s.current) return 'active'
    const c = s.comp[id]
    if (c === null) return 'idle'
    return COMP_TONES[c % COMP_TONES.length]
  }

  const nodes: GCNode[] = layout.map(p => ({
    id: p.id,
    x: p.x,
    y: p.y,
    label: String(p.id),
    sub: s.comp[p.id] !== null ? `c${s.comp[p.id]}` : undefined,
    tone: nodeTone(p.id),
  }))

  const edges: GCEdge[] = s.edges.map(e => {
    const c = s.comp[e.from]
    const tone: GraphTone =
      c !== null && c === s.comp[e.to]
        ? COMP_TONES[c % COMP_TONES.length]
        : 'idle'
    return { from: e.from, to: e.to, tone }
  })

  return (
    <VisualizerShell
      title="Componente conexe"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-3 py-2">
        <GraphCanvas nodes={nodes} edges={edges} />
        <span className="font-mono text-xs text-muted-foreground">
          componente găsite:{' '}
          <span className="font-semibold text-foreground">
            {s.numComponents}
          </span>
        </span>
      </div>
    </VisualizerShell>
  )
}
