'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Frame, StepPlayerControls } from './types'

export function useStepPlayer<T>(frames: Frame<T>[]): StepPlayerControls<T> {
  if (frames.length === 0) {
    throw new Error('useStepPlayer requires at least one frame')
  }
  const total = frames.length
  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeedState] = useState(1)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isPlaying) {
      clearTimer()
      return
    }
    intervalRef.current = setInterval(() => {
      setIndex(prev => {
        const next = prev + 1
        if (next >= total - 1) {
          setIsPlaying(false)
          return Math.min(next, total - 1)
        }
        return next
      })
    }, 1000 / speed)
    return clearTimer
  }, [isPlaying, speed, total, clearTimer])

  const next = useCallback(() => {
    setIndex(i => Math.min(i + 1, total - 1))
  }, [total])

  const prev = useCallback(() => {
    setIndex(i => Math.max(i - 1, 0))
  }, [])

  const reset = useCallback(() => {
    clearTimer()
    setIsPlaying(false)
    setIndex(0)
  }, [clearTimer])

  const play = useCallback(() => {
    setIndex(i => {
      if (i >= total - 1) return 0
      return i
    })
    setIsPlaying(true)
  }, [total])

  const pause = useCallback(() => {
    clearTimer()
    setIsPlaying(false)
  }, [clearTimer])

  const goTo = useCallback(
    (target: number) => {
      setIndex(Math.max(0, Math.min(target, total - 1)))
    },
    [total],
  )

  const setSpeed = useCallback((s: number) => {
    setSpeedState(s)
  }, [])

  return {
    index,
    currentFrame: frames[Math.min(index, total - 1)],
    isPlaying,
    speed,
    progress: total <= 1 ? 1 : index / (total - 1),
    next,
    prev,
    reset,
    play,
    pause,
    goTo,
    setSpeed,
  }
}
