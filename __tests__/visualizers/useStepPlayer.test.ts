// @vitest-environment jsdom

import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useStepPlayer } from '@/lib/visualizers/useStepPlayer'
import type { Frame } from '@/lib/visualizers/types'

function makeFrames(n: number): Frame<number>[] {
  return Array.from({ length: n }, (_, i) => ({
    state: i,
    explanation: `Pasul ${i}`,
  }))
}

describe('useStepPlayer — navigare', () => {
  it('starts at index 0', () => {
    const { result } = renderHook(() => useStepPlayer(makeFrames(3)))
    expect(result.current.index).toBe(0)
    expect(result.current.currentFrame.state).toBe(0)
    expect(result.current.isPlaying).toBe(false)
  })

  it('next() advances index', () => {
    const { result } = renderHook(() => useStepPlayer(makeFrames(3)))
    act(() => result.current.next())
    expect(result.current.index).toBe(1)
  })

  it('next() does not exceed last frame', () => {
    const { result } = renderHook(() => useStepPlayer(makeFrames(3)))
    act(() => result.current.goTo(2))
    act(() => result.current.next())
    expect(result.current.index).toBe(2)
  })

  it('prev() goes back one frame', () => {
    const { result } = renderHook(() => useStepPlayer(makeFrames(3)))
    act(() => result.current.goTo(2))
    act(() => result.current.prev())
    expect(result.current.index).toBe(1)
  })

  it('prev() does not go below 0', () => {
    const { result } = renderHook(() => useStepPlayer(makeFrames(3)))
    act(() => result.current.prev())
    expect(result.current.index).toBe(0)
  })

  it('reset() returns to frame 0', () => {
    const { result } = renderHook(() => useStepPlayer(makeFrames(3)))
    act(() => result.current.goTo(2))
    act(() => result.current.reset())
    expect(result.current.index).toBe(0)
  })

  it('reset() stops playback', () => {
    const { result } = renderHook(() => useStepPlayer(makeFrames(3)))
    act(() => result.current.play())
    act(() => result.current.reset())
    expect(result.current.isPlaying).toBe(false)
  })

  it('goTo() jumps to given frame', () => {
    const { result } = renderHook(() => useStepPlayer(makeFrames(5)))
    act(() => result.current.goTo(3))
    expect(result.current.index).toBe(3)
    expect(result.current.currentFrame.state).toBe(3)
  })

  it('goTo() clamps negative to 0', () => {
    const { result } = renderHook(() => useStepPlayer(makeFrames(5)))
    act(() => result.current.goTo(-5))
    expect(result.current.index).toBe(0)
  })

  it('goTo() clamps beyond last to last index', () => {
    const { result } = renderHook(() => useStepPlayer(makeFrames(5)))
    act(() => result.current.goTo(99))
    expect(result.current.index).toBe(4)
  })

  it('progress is 0 at start and 1 at last frame', () => {
    const { result } = renderHook(() => useStepPlayer(makeFrames(5)))
    expect(result.current.progress).toBe(0)
    act(() => result.current.goTo(4))
    expect(result.current.progress).toBe(1)
  })

  it('progress is 0.5 at middle frame of 5', () => {
    const { result } = renderHook(() => useStepPlayer(makeFrames(5)))
    act(() => result.current.goTo(2))
    expect(result.current.progress).toBe(0.5)
  })
})

describe('useStepPlayer — autoplay', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('play() sets isPlaying to true', () => {
    const { result } = renderHook(() => useStepPlayer(makeFrames(5)))
    act(() => result.current.play())
    expect(result.current.isPlaying).toBe(true)
  })

  it('pause() sets isPlaying to false', () => {
    const { result } = renderHook(() => useStepPlayer(makeFrames(5)))
    act(() => result.current.play())
    act(() => result.current.pause())
    expect(result.current.isPlaying).toBe(false)
  })

  it('advances one frame per second at speed=1', () => {
    const { result } = renderHook(() => useStepPlayer(makeFrames(5)))
    act(() => result.current.play())
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.index).toBe(1)
  })

  it('advances two frames after 2s at speed=1', () => {
    const { result } = renderHook(() => useStepPlayer(makeFrames(5)))
    act(() => result.current.play())
    act(() => vi.advanceTimersByTime(2000))
    expect(result.current.index).toBe(2)
  })

  it('pauses automatically at last frame', () => {
    const { result } = renderHook(() => useStepPlayer(makeFrames(3)))
    act(() => result.current.play())
    act(() => vi.advanceTimersByTime(2000))
    expect(result.current.index).toBe(2)
    expect(result.current.isPlaying).toBe(false)
  })

  it('play() from last frame resets to 0 and plays', () => {
    const { result } = renderHook(() => useStepPlayer(makeFrames(3)))
    act(() => result.current.goTo(2))
    act(() => result.current.play())
    expect(result.current.index).toBe(0)
    expect(result.current.isPlaying).toBe(true)
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.index).toBe(1)
  })

  it('timer fires faster at speed=2', () => {
    const { result } = renderHook(() => useStepPlayer(makeFrames(5)))
    act(() => result.current.setSpeed(2))
    act(() => result.current.play())
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.index).toBe(2)
  })
})
