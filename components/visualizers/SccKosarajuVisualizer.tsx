'use client'

import { useMemo, useEffect, useState } from 'react'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateSccKosaraju } from '@/lib/visualizers/generators/scc-kosaraju'
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
  directed: true,
  edges: [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 2, to: 0 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 4, to: 5 },
    { from: 5, to: 3 },
    { from: 5, to: 6 },
  ],
}

const COMP_TONES: GraphTone[] = ['visited', 'path', 'frontier', 'done', 'source']

const LAB_FIELDS: LabField[] = [
  {
    id: 'edges',
    label: 'Arce „u v" orientate (separate prin ;)',
    placeholder: 'ex: 0 1 ; 1 2 ; 2 0',
    hint: 'Graf orientat · noduri de la 0',
    validate: raw => {
      const g = parseEdgeList(raw, { weighted: false, directed: true })
      if (!g) return 'Fiecare arc: „u v", separate prin ;.'
      if (g.n > 10) return 'Maximum 10 noduri.'
      return null
    },
  },
]

export function SccKosarajuVisualizer() {
  const [graph, setGraph] = useState<Graph>(DEFAULT_GRAPH)
  const layout = useMemo(() => circularLayout(graph.n), [graph.n])
  const frames = useMemo(() => generateSccKosaraju({ graph }), [graph])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [graph, reset])

  const s = player.currentFrame.state

  function handleLabSubmit(v: Record<string, string>) {
    const g = parseEdgeList(v.edges ?? '', { weighted: false, directed: true })
    if (g && g.n <= 10) setGraph(g)
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
    sub: s.comp[p.id] !== null ? `S${s.comp[p.id]}` : undefined,
    tone: nodeTone(p.id),
  }))

  const edges: GCEdge[] = s.edges.map(e => {
    const c = s.comp[e.from]
    const tone: GraphTone =
      c !== null && c === s.comp[e.to]
        ? COMP_TONES[c % COMP_TONES.length]
        : 'idle'
    return { from: e.from, to: e.to, directed: true, tone }
  })

  return (
    <VisualizerShell
      title="Componente tare conexe — Kosaraju"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-3 py-2">
        <GraphCanvas nodes={nodes} edges={edges} />
        <div className="flex flex-wrap items-center justify-center gap-x-4 font-mono text-xs text-muted-foreground">
          <span>
            {s.phase === 'pass1'
              ? 'pasul 1: DFS pe graful original'
              : s.phase === 'pass2'
                ? 'pasul 2: DFS pe graful transpus'
                : 'gata'}
          </span>
          <span>
            CTC găsite:{' '}
            <span className="font-semibold text-foreground">{s.numSccs}</span>
          </span>
        </div>
      </div>
    </VisualizerShell>
  )
}
