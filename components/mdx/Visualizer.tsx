'use client'

import { getVisualizer } from '@/components/visualizers/registry'

interface VisualizerProps {
  name: string
}

export function Visualizer({ name }: VisualizerProps) {
  const Component = getVisualizer(name)

  if (!Component) {
    return (
      <div className="my-6 flex min-h-[200px] items-center justify-center rounded-[16px] border-2 border-dashed border-border bg-muted/30">
        <p className="font-mono text-sm text-muted-foreground">
          Vizualizare: <span className="text-primary">{name}</span>
          <span className="ml-2 opacity-60">(disponibil în curând)</span>
        </p>
      </div>
    )
  }

  return <Component />
}
