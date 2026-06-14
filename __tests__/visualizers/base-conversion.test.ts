import { describe, it, expect } from 'vitest'
import { generateBaseConversion } from '@/lib/visualizers/generators/base-conversion'

function representation(value: number, base: number): string {
  const last = generateBaseConversion({ value, base }).at(-1)!.state
  return last.result ?? ''
}

describe('generateBaseConversion', () => {
  it('converts to the expected representation', () => {
    expect(representation(45, 2)).toBe('101101')
    expect(representation(255, 16)).toBe('FF')
    expect(representation(100, 8)).toBe('144')
  })

  it('handles 0 in any base', () => {
    expect(representation(0, 2)).toBe('0')
    expect(representation(0, 16)).toBe('0')
  })

  it('throws on invalid base', () => {
    expect(() => generateBaseConversion({ value: 45, base: 1 })).toThrow()
    expect(() => generateBaseConversion({ value: 45, base: 17 })).toThrow()
  })

  it('throws on invalid value', () => {
    expect(() => generateBaseConversion({ value: -1, base: 2 })).toThrow()
    expect(() => generateBaseConversion({ value: 1e9 + 1, base: 2 })).toThrow()
  })

  it('emits one frame per division step plus intro and final', () => {
    const frames = generateBaseConversion({ value: 45, base: 2 })
    // Each division step adds one entry to steps; the final step count equals
    // the number of digits. 45 in base 2 has 6 digits => 6 division steps.
    const divFrames = frames.filter(f => f.state.steps.length > 0 && !f.state.done)
    expect(divFrames.length).toBe(6)
    expect(frames.at(-1)!.state.steps.length).toBe(6)
    expect(frames.at(-1)!.state.done).toBe(true)
  })
})
