import type { ComponentType } from 'react'
import dynamic from 'next/dynamic'

// Each entry uses dynamic import with ssr:false — visualizers are interactive
// client components that rely on hooks and should not be server-rendered.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry: Record<string, ComponentType<any>> = {
  'array-traversal': dynamic(
    () =>
      import('./ArrayVisualizer').then(m => ({ default: m.ArrayVisualizer })),
    { ssr: false },
  ),
}

export function getVisualizer(name: string): ComponentType<unknown> | null {
  return registry[name] ?? null
}
