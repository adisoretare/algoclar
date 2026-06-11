'use client'

import { useMemo } from 'react'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateDsu } from '@/lib/visualizers/generators/dsu'
import type { DsuOp } from '@/lib/visualizers/generators/dsu'
import { circularLayout } from '@/lib/visualizers/graph-layout'
import { VisualizerShell } from './VisualizerShell'
import { GraphCanvas } from './GraphCanvas'
import type { GCNode, GCEdge, GraphTone } from './GraphCanvas'

const N = 7
const OPERATIONS: DsuOp[] = [
  { type: 'union', a: 0, b: 1 },
  { type: 'union', a: 0, b: 2 },
  { type: 'union', a: 3, b: 4 },
  { type: 'union', a: 0, b: 3 },
  { type: 'union', a: 5, b: 6 },
  { type: 'find', a: 4 },
  { type: 'union', a: 2, b: 6 },
]

export function DsuVisualizer() {
  const layout = useMemo(() => circularLayout(N), [])
  const frames = useMemo(
    () => generateDsu({ n: N, operations: OPERATIONS }),
    [],
  )
  const player = useStepPlayer(frames)
  const s = player.currentFrame.state

  const onPath = new Set(s.highlightPath)
  const roots = new Set(s.roots ?? [])

  const nodeTone = (id: number): GraphTone => {
    if (s.parent[id] === id) return 'done' // a root
    if (onPath.has(id)) return 'active'
    if (roots.has(id)) return 'frontier'
    return 'idle'
  }

  const nodes: GCNode[] = layout.map(p => ({
    id: p.id,
    x: p.x,
    y: p.y,
    label: String(p.id),
    tone: nodeTone(p.id),
  }))

  // parent pointers as directed edges
  const edges: GCEdge[] = []
  for (let i = 0; i < s.n; i++) {
    if (s.parent[i] !== i) {
      const onP = onPath.has(i)
      edges.push({
        from: i,
        to: s.parent[i],
        directed: true,
        tone: onP ? 'active' : 'visited',
      })
    }
  }

  const opLabel =
    s.op === 'union'
      ? `union(${s.a}, ${s.b})`
      : s.op === 'find'
        ? `find(${s.a}) → ${s.result}`
        : s.done
          ? 'gata'
          : 'init'

  return (
    <VisualizerShell
      title="Union-Find (DSU) — uniune după rang + compresie de drum"
      player={player}
      frameCount={frames.length}
    >
      <div className="flex flex-col items-center gap-3 py-2">
        <span className="rounded-[8px] bg-primary/10 px-3 py-1 font-mono text-xs font-semibold text-primary">
          {opLabel}
        </span>
        <GraphCanvas nodes={nodes} edges={edges} />
        <span className="font-mono text-[11px] text-muted-foreground">
          săgețile arată „părintele”; nodurile fără săgeată sunt rădăcini (reprezentanții mulțimilor)
        </span>
      </div>
    </VisualizerShell>
  )
}
