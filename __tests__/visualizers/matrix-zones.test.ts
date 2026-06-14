import { describe, it, expect } from 'vitest'
import {
  generateMatrixZones,
  classifyCell,
} from '@/lib/visualizers/generators/matrix-zones'
import type { Zone } from '@/lib/visualizers/generators/matrix-zones'

describe('generateMatrixZones', () => {
  it('throws for n < 2', () => {
    expect(() => generateMatrixZones({ n: 1 })).toThrow()
  })

  it('throws for n > 9', () => {
    expect(() => generateMatrixZones({ n: 10 })).toThrow()
  })

  it('classifies the main diagonal (i == j) as principala for n=5', () => {
    let count = 0
    for (let k = 0; k < 5; k++) {
      // (2,2) is the center for odd n, so skip it for this exact check
      if (k === 2) continue
      expect(classifyCell(k, k, 5)).toBe<Zone>('principala')
      count++
    }
    expect(count).toBe(4)
  })

  it('classifies the secondary diagonal (i + j == 4) as secundara for n=5', () => {
    let count = 0
    for (let i = 0; i < 5; i++) {
      const j = 4 - i
      if (i === 2) continue // center cell
      expect(classifyCell(i, j, 5)).toBe<Zone>('secundara')
      count++
    }
    expect(count).toBe(4)
  })

  it('handles the center cell (2,2) consistently as centru for n=5', () => {
    expect(classifyCell(2, 2, 5)).toBe<Zone>('centru')
    const frames = generateMatrixZones({ n: 5 })
    const last = frames.at(-1)!
    expect(last.state.grid[2][2].zone).toBe<Zone>('centru')
  })

  it('assigns a valid zone to every one of the 25 cells for n=5', () => {
    const valid: Zone[] = [
      'principala',
      'secundara',
      'nord',
      'sud',
      'vest',
      'est',
      'centru',
    ]
    const frames = generateMatrixZones({ n: 5 })
    const last = frames.at(-1)!
    let total = 0
    let principalaCount = 0
    let secundaraCount = 0
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const cell = last.state.grid[i][j]
        expect(valid).toContain(cell.zone)
        if (cell.zone === 'principala') principalaCount++
        if (cell.zone === 'secundara') secundaraCount++
        total++
      }
    }
    expect(total).toBe(25)
    // 5 cells satisfy i==j; center (2,2) takes 'centru', so 4 remain principala.
    expect(principalaCount).toBe(4)
    expect(secundaraCount).toBe(4)
  })

  it('reveals every cell in the final frame', () => {
    const frames = generateMatrixZones({ n: 5 })
    const last = frames.at(-1)!
    expect(last.state.done).toBe(true)
    for (const row of last.state.grid) {
      for (const cell of row) {
        expect(cell.revealed).toBe(true)
      }
    }
  })

  it('n=2 has only diagonal zones and emits no empty-zone frames', () => {
    const frames = generateMatrixZones({ n: 2 })
    // 2×2 splits into principala + secundara only (no triangles, no center).
    const last = frames.at(-1)!
    const present = new Set<Zone>()
    for (const row of last.state.grid) for (const cell of row) present.add(cell.zone)
    expect([...present].sort()).toEqual(['principala', 'secundara'])

    // Every revealing frame must target a zone that actually has cells.
    for (const f of frames) {
      if (f.state.currentZone !== null) {
        expect(present.has(f.state.currentZone)).toBe(true)
      }
    }
    // intro + principala + secundara + done = 4 frames (no empty triangles).
    expect(frames.length).toBe(4)
  })

  it('classifies all 4 main-diagonal cells as principala for even n=4', () => {
    let principalaCount = 0
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (classifyCell(i, j, 4) === 'principala') principalaCount++
      }
    }
    expect(principalaCount).toBe(4)
  })
})
