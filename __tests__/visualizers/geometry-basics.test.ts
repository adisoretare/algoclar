import { describe, it, expect } from 'vitest'
import { generateGeometryBasics } from '@/lib/visualizers/generators/geometry-basics'
import type { Point } from '@/lib/visualizers/generators/geometry-basics'

const P = (x: number, y: number, label: string): Point => ({ x, y, label })

describe('generateGeometryBasics', () => {
  it('computes a 3-4-5 distance', () => {
    const frames = generateGeometryBasics({
      points: [P(0, 0, 'A'), P(3, 4, 'B'), P(0, 4, 'C')],
    })
    const dist = frames.find(
      f => f.state.result?.kind === 'distance',
    )!.state.result!
    expect(dist.value).toBe(5)
  })

  it('computes a right-triangle area', () => {
    // A(0,0) B(4,0) C(0,3) -> area = 6
    const last = generateGeometryBasics({
      points: [P(0, 0, 'A'), P(4, 0, 'B'), P(0, 3, 'C')],
    }).at(-1)!.state
    expect(last.done).toBe(true)
    expect(last.result?.kind).toBe('area')
    expect(last.result?.value).toBe(6)
  })

  it('area is orientation-independent (absolute value)', () => {
    const cw = generateGeometryBasics({
      points: [P(0, 0, 'A'), P(0, 3, 'B'), P(4, 0, 'C')],
    }).at(-1)!.state
    expect(cw.result?.value).toBe(6)
  })

  it('collinear points give zero area', () => {
    const last = generateGeometryBasics({
      points: [P(0, 0, 'A'), P(2, 2, 'B'), P(5, 5, 'C')],
    }).at(-1)!.state
    expect(last.result?.value).toBe(0)
  })
})
