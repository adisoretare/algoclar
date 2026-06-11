import type { Frame, FrameGenerator } from '../types'

export interface Point {
  x: number
  y: number
  label: string
}

export interface GeometryState {
  points: readonly Point[] // exactly 3: A, B, C
  phase: 'distance' | 'area' | 'done'
  highlight: readonly number[] // highlighted point indices
  segment: readonly [number, number] | null // draw a segment between two points
  triangle: boolean // draw the full triangle
  result: { kind: 'distance' | 'area'; value: number } | null
  done: boolean
}

export interface GeometryInput {
  points: [Point, Point, Point]
}

function round2(x: number) {
  return Math.round(x * 100) / 100
}

/**
 * Two foundational geometry computations:
 *  - distance AB = sqrt(dx² + dy²)
 *  - triangle area via the shoelace formula |x_A(y_B−y_C)+x_B(y_C−y_A)+x_C(y_A−y_B)| / 2
 */
export const generateGeometryBasics: FrameGenerator<
  GeometryInput,
  GeometryState
> = ({ points }) => {
  if (points.length !== 3) {
    throw new Error('generateGeometryBasics: nevoie de exact 3 puncte')
  }
  const [A, B, C] = points
  const frames: Frame<GeometryState>[] = []

  frames.push({
    state: {
      points,
      phase: 'distance',
      highlight: [0, 1, 2],
      segment: null,
      triangle: false,
      result: null,
      done: false,
    },
    explanation: `Avem trei puncte: ${A.label}(${A.x}, ${A.y}), ${B.label}(${B.x}, ${B.y}), ${C.label}(${C.x}, ${C.y}).`,
  })

  // Distance AB
  const dx = B.x - A.x
  const dy = B.y - A.y
  frames.push({
    state: {
      points,
      phase: 'distance',
      highlight: [0, 1],
      segment: [0, 1],
      triangle: false,
      result: null,
      done: false,
    },
    explanation: `Distanța ${A.label}${B.label}: diferențele pe axe sunt dx = ${B.x} − ${A.x} = ${dx} și dy = ${B.y} − ${A.y} = ${dy}.`,
  })
  const dist = Math.sqrt(dx * dx + dy * dy)
  frames.push({
    state: {
      points,
      phase: 'distance',
      highlight: [0, 1],
      segment: [0, 1],
      triangle: false,
      result: { kind: 'distance', value: round2(dist) },
      done: false,
    },
    explanation: `Teorema lui Pitagora: ${A.label}${B.label} = √(${dx}² + ${dy}²) = √${dx * dx + dy * dy} ≈ ${round2(dist)}.`,
  })

  // Triangle area (shoelace)
  const twiceArea = A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y)
  const area = Math.abs(twiceArea) / 2
  frames.push({
    state: {
      points,
      phase: 'area',
      highlight: [0, 1, 2],
      segment: null,
      triangle: true,
      result: null,
      done: false,
    },
    explanation: `Aria triunghiului ${A.label}${B.label}${C.label} cu formula ariei (shoelace): folosim coordonatele celor 3 vârfuri.`,
  })
  frames.push({
    state: {
      points,
      phase: 'area',
      highlight: [0, 1, 2],
      segment: null,
      triangle: true,
      result: { kind: 'area', value: round2(area) },
      done: false,
    },
    explanation: `Aria = |${A.x}·(${B.y}−${C.y}) + ${B.x}·(${C.y}−${A.y}) + ${C.x}·(${A.y}−${B.y})| / 2 = |${twiceArea}| / 2 = ${round2(area)}.`,
  })

  frames.push({
    state: {
      points,
      phase: 'done',
      highlight: [0, 1, 2],
      segment: null,
      triangle: true,
      result: { kind: 'area', value: round2(area) },
      done: true,
    },
    explanation: `Distanța ${A.label}${B.label} ≈ ${round2(dist)}, aria triunghiului = ${round2(area)}. Cele două formule de bază din geometria în plan.`,
  })

  return frames
}
