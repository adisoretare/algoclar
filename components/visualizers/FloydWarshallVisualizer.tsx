'use client'

import { useMemo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import { generateFloydWarshall } from '@/lib/visualizers/generators/floyd-warshall'
import type { Graph } from '@/lib/visualizers/generators/graph-types'
import { parseEdgeList } from '@/lib/visualizers/parse-graph'
import { VisualizerShell } from './VisualizerShell'
import { LabInput } from './LabInput'
import type { LabField } from './LabInput'

const DEFAULT_GRAPH: Graph = {
  n: 4,
  directed: true,
  edges: [
    { from: 0, to: 1, weight: 3 },
    { from: 0, to: 3, weight: 7 },
    { from: 1, to: 0, weight: 8 },
    { from: 1, to: 2, weight: 2 },
    { from: 2, to: 0, weight: 5 },
    { from: 2, to: 3, weight: 1 },
    { from: 3, to: 0, weight: 2 },
  ],
}

const LAB_FIELDS: LabField[] = [
  {
    id: 'edges',
    label: 'Arce „u v cost" (separate prin ;)',
    placeholder: 'ex: 0 1 3 ; 1 2 2',
    hint: 'Graf orientat · maximum 7 noduri · noduri de la 0',
    validate: raw => {
      const g = parseEdgeList(raw, { weighted: true, directed: true })
      if (!g) return 'Fiecare arc: „u v cost", separate prin ;.'
      if (g.n > 7) return 'Maximum 7 noduri.'
      return null
    },
  },
]

export function FloydWarshallVisualizer() {
  const [graph, setGraph] = useState<Graph>(DEFAULT_GRAPH)
  const frames = useMemo(() => generateFloydWarshall({ graph }), [graph])
  const player = useStepPlayer(frames)
  const { reset } = player

  useEffect(() => {
    reset()
  }, [graph, reset])

  const s = player.currentFrame.state

  function handleLabSubmit(v: Record<string, string>) {
    const g = parseEdgeList(v.edges ?? '', { weighted: true, directed: true })
    if (g && g.n <= 7) setGraph(g)
  }

  return (
    <VisualizerShell
      title="Floyd-Warshall (Roy-Floyd) — drumuri minime între toate perechile"
      player={player}
      frameCount={frames.length}
      labZone={<LabInput fields={LAB_FIELDS} onSubmit={handleLabSubmit} />}
    >
      <div className="flex flex-col items-center gap-3 py-2">
        <span className="font-mono text-xs font-semibold text-primary">
          {s.k >= 0 ? `nod intermediar permis: k = ${s.k}` : s.done ? 'gata' : 'matricea inițială'}
        </span>
        <table className="border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="h-7 w-9 font-mono text-[10px] text-muted-foreground">
                i\j
              </th>
              {Array.from({ length: s.n }, (_, j) => (
                <th
                  key={j}
                  className={cn(
                    'h-7 w-9 font-mono text-xs font-bold',
                    s.k === j ? 'text-warning' : 'text-foreground',
                  )}
                >
                  {j}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {s.dist.map((row, i) => (
              <tr key={i}>
                <th
                  className={cn(
                    'h-9 w-9 font-mono text-xs font-bold',
                    s.k === i ? 'text-warning' : 'text-foreground',
                  )}
                >
                  {i}
                </th>
                {row.map((value, j) => {
                  const isUpdate =
                    s.phase === 'update' && s.i === i && s.j === j
                  const isDep =
                    s.phase === 'update' &&
                    ((i === s.i && j === s.k) || (i === s.k && j === s.j))
                  const onPivotLine = s.k === i || s.k === j
                  return (
                    <td key={j}>
                      <div
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-[6px] border-2 font-mono text-xs font-semibold tabular-nums transition-all duration-200',
                          isUpdate
                            ? 'scale-110 border-primary bg-accent text-primary'
                            : isDep
                              ? 'border-success bg-success/15 text-success'
                              : onPivotLine && s.k >= 0
                                ? 'border-warning/50 bg-warning/10 text-foreground'
                                : value === null
                                  ? 'border-border bg-muted/40 text-muted-foreground/40'
                                  : 'border-border bg-muted text-foreground',
                        )}
                      >
                        {value === null ? '∞' : value}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </VisualizerShell>
  )
}
