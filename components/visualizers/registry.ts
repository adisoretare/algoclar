import type { ComponentType } from 'react'

// To add a new visualizer:
// import dynamic from 'next/dynamic'
// 'my-visualizer': dynamic(() => import('./MyVisualizer'), { ssr: false }),
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry: Record<string, ComponentType<any>> = {}

export function getVisualizer(name: string): ComponentType<unknown> | null {
  return registry[name] ?? null
}
