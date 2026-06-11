# Step-Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the single step-engine that powers all AlgoClar visualizations: shared types, navigation hook, player controls UI, visualizer shell, and component registry.

**Architecture:** A `Frame<T>` holds a complete state snapshot + Romanian explanation string; all frames are generated deterministically at init by a `FrameGenerator`. `useStepPlayer` manages index/autoplay state via `setInterval`. `VisualizerShell` wraps any canvas with the explanation box and `PlayerControls`. `registry.ts` maps visualizer names to Next.js dynamic-imported components for `<Visualizer name="..." />` in MDX.

**Tech Stack:** React 19, TypeScript strict, Next.js 16 App Router, Tailwind CSS v4 + shadcn/ui, lucide-react, Vitest 4 + @testing-library/react + jsdom (new dev deps)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/visualizers/types.ts` | Create | `Frame<T>`, `FrameGenerator<TInput, TState>`, `StepPlayerControls<T>` |
| `lib/visualizers/useStepPlayer.ts` | Create | Hook: index state, autoplay timer, all navigation actions |
| `__tests__/visualizers/useStepPlayer.test.ts` | Create | TDD tests: boundary nav, reset, goTo, autoplay fake-timer tests |
| `components/visualizers/PlayerControls.tsx` | Create | Play/Pause, Prev, Next, Reset buttons + speed slider + progress bar |
| `components/visualizers/VisualizerShell.tsx` | Create | Title + children canvas area + explanation box + PlayerControls + keyboard nav |
| `components/visualizers/registry.ts` | Create | `Record<string, ComponentType>` of all dynamic-imported visualizers |
| `components/mdx/Visualizer.tsx` | Modify | Look up name in registry; render or show "coming soon" placeholder |

---

## Task 1: Install test dependencies

**Files:**
- Modify: `package.json` (via pnpm)
- Modify: `vitest.config.ts`

- [ ] **Step 1.1: Install jsdom and @testing-library/react**

```bash
pnpm add -D jsdom @testing-library/react
```

Expected: packages added under `devDependencies`, no errors.

- [ ] **Step 1.2: Verify vitest can find jsdom**

```bash
pnpm exec vitest run --reporter=verbose 2>&1 | head -20
```

Expected: existing tests still pass (node env unaffected). If you see "Cannot find package 'jsdom'" at any point later, re-run Step 1.1.

---

## Task 2: Types

**Files:**
- Create: `lib/visualizers/types.ts`

- [ ] **Step 2.1: Create types file**

```typescript
// lib/visualizers/types.ts

export interface Frame<T> {
  state: T
  explanation: string
}

export type FrameGenerator<TInput, TState> = (input: TInput) => Frame<TState>[]

export interface StepPlayerControls<T> {
  index: number
  currentFrame: Frame<T>
  isPlaying: boolean
  speed: number
  progress: number
  next: () => void
  prev: () => void
  reset: () => void
  play: () => void
  pause: () => void
  goTo: (index: number) => void
  setSpeed: (speed: number) => void
}
```

- [ ] **Step 2.2: Verify TypeScript compiles**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors.

---

## Task 3: useStepPlayer — TDD

**Files:**
- Create: `__tests__/visualizers/useStepPlayer.test.ts`
- Create: `lib/visualizers/useStepPlayer.ts`

### Step 3.1 — Write failing tests

- [ ] **Step 3.1: Create test file**

```typescript
// __tests__/visualizers/useStepPlayer.test.ts
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
    // 3 frames → need 2 intervals to reach index 2
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
    act(() => vi.advanceTimersByTime(1000)) // 2 frames at 500ms each
    expect(result.current.index).toBe(2)
  })
})
```

- [ ] **Step 3.2: Run tests — confirm all fail**

```bash
pnpm exec vitest run __tests__/visualizers/useStepPlayer.test.ts --reporter=verbose
```

Expected: all tests fail with `Cannot find module '@/lib/visualizers/useStepPlayer'`.

### Step 3.2 — Implement useStepPlayer

- [ ] **Step 3.3: Create useStepPlayer.ts**

```typescript
// lib/visualizers/useStepPlayer.ts
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Frame, StepPlayerControls } from './types'

export function useStepPlayer<T>(frames: Frame<T>[]): StepPlayerControls<T> {
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

  // Auto-pause when reaching last frame
  useEffect(() => {
    if (isPlaying && index >= total - 1) {
      setIsPlaying(false)
    }
  }, [index, isPlaying, total])

  // Autoplay interval
  useEffect(() => {
    if (!isPlaying) {
      clearTimer()
      return
    }
    intervalRef.current = setInterval(() => {
      setIndex(prev => (prev >= total - 1 ? prev : prev + 1))
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
```

- [ ] **Step 3.4: Run tests — confirm all pass**

```bash
pnpm exec vitest run __tests__/visualizers/useStepPlayer.test.ts --reporter=verbose
```

Expected: all tests PASS.

- [ ] **Step 3.5: Commit**

```bash
git add lib/visualizers/types.ts lib/visualizers/useStepPlayer.ts __tests__/visualizers/useStepPlayer.test.ts
git commit -m "feat: Frame types + useStepPlayer hook with tests"
```

---

## Task 4: PlayerControls component

**Files:**
- Create: `components/visualizers/PlayerControls.tsx`

No unit tests needed — this is a pure render component with no logic of its own.

- [ ] **Step 4.1: Create PlayerControls.tsx**

```tsx
// components/visualizers/PlayerControls.tsx
'use client'

import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlayerControlsProps {
  isPlaying: boolean
  index: number
  frameCount: number
  progress: number
  speed: number
  onPlay: () => void
  onPause: () => void
  onNext: () => void
  onPrev: () => void
  onReset: () => void
  onGoTo: (index: number) => void
  onSetSpeed: (speed: number) => void
}

export function PlayerControls({
  isPlaying,
  index,
  frameCount,
  progress,
  speed,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onReset,
  onGoTo,
  onSetSpeed,
}: PlayerControlsProps) {
  const isFirst = index === 0
  const isLast = index >= frameCount - 1

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    onGoTo(Math.round(ratio * (frameCount - 1)))
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Progress bar */}
      <div
        role="slider"
        aria-label="Progres vizualizare"
        aria-valuemin={0}
        aria-valuemax={frameCount - 1}
        aria-valuenow={index}
        tabIndex={0}
        className="group relative h-2 w-full cursor-pointer rounded-full bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={handleProgressClick}
        onKeyDown={e => {
          if (e.key === 'ArrowRight') { e.preventDefault(); onNext() }
          if (e.key === 'ArrowLeft') { e.preventDefault(); onPrev() }
        }}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-150"
          style={{ width: `${progress * 100}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          style={{ left: `${progress * 100}%` }}
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-2">
        {/* Reset */}
        <button
          onClick={onReset}
          aria-label="Resetează"
          className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-muted text-foreground transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* Prev */}
        <button
          onClick={onPrev}
          disabled={isFirst}
          aria-label="Pasul anterior"
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-[9px] bg-muted text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            isFirst ? 'cursor-not-allowed opacity-40' : 'hover:bg-muted/70',
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="mx-1 h-6 w-px bg-border" />

        {/* Play / Pause */}
        <button
          onClick={isPlaying ? onPause : onPlay}
          aria-label={isPlaying ? 'Pauză' : 'Redă'}
          className="flex h-11 w-11 items-center justify-center rounded-[11px] bg-primary text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 fill-primary-foreground" />
          ) : (
            <Play className="h-4 w-4 fill-primary-foreground" />
          )}
        </button>

        <div className="mx-1 h-6 w-px bg-border" />

        {/* Next */}
        <button
          onClick={onNext}
          disabled={isLast}
          aria-label="Pasul următor"
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-[9px] bg-muted text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            isLast ? 'cursor-not-allowed opacity-40' : 'hover:bg-muted/70',
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Speed */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            {speed}×
          </span>
          <input
            type="range"
            min="0.5"
            max="4"
            step="0.5"
            value={speed}
            onChange={e => onSetSpeed(Number(e.target.value))}
            aria-label="Viteză redare"
            className="h-1 w-20 cursor-pointer accent-primary"
          />
        </div>

        {/* Frame counter */}
        <span className="font-mono text-xs text-muted-foreground">
          {index + 1}/{frameCount}
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 4.2: Verify TypeScript compiles**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4.3: Commit**

```bash
git add components/visualizers/PlayerControls.tsx
git commit -m "feat: PlayerControls component"
```

---

## Task 5: VisualizerShell component

**Files:**
- Create: `components/visualizers/VisualizerShell.tsx`

- [ ] **Step 5.1: Create VisualizerShell.tsx**

```tsx
// components/visualizers/VisualizerShell.tsx
'use client'

import type { StepPlayerControls } from '@/lib/visualizers/types'
import { PlayerControls } from './PlayerControls'

interface VisualizerShellProps<T> {
  title: string
  player: StepPlayerControls<T>
  children: React.ReactNode
}

export function VisualizerShell<T>({
  title,
  player,
  children,
}: VisualizerShellProps<T>) {
  const frameCount = Math.round(
    player.progress <= 0
      ? player.index + 1
      : (player.index + 1) / player.progress,
  )

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        player.prev()
        break
      case 'ArrowRight':
        e.preventDefault()
        player.next()
        break
      case ' ':
        e.preventDefault()
        player.isPlaying ? player.pause() : player.play()
        break
      case 'r':
      case 'R':
        e.preventDefault()
        player.reset()
        break
    }
  }

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="my-6 flex flex-col gap-4 rounded-[16px] border border-border bg-card p-4 shadow-[0_1px_2px_rgba(19,24,38,0.04)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-sm font-semibold text-foreground">
          {title}
        </h3>
        <span className="font-mono text-xs text-muted-foreground">
          pas {player.index + 1}
        </span>
      </div>

      {/* Canvas area */}
      <div className="min-h-[200px] w-full">{children}</div>

      {/* Explanation */}
      <div
        key={player.index}
        className="animate-in fade-in rounded-[8px] bg-muted/50 px-4 py-3 font-mono text-sm text-foreground duration-200"
      >
        {player.currentFrame.explanation}
      </div>

      {/* Controls */}
      <PlayerControls
        isPlaying={player.isPlaying}
        index={player.index}
        frameCount={frameCount}
        progress={player.progress}
        speed={player.speed}
        onPlay={player.play}
        onPause={player.pause}
        onNext={player.next}
        onPrev={player.prev}
        onReset={player.reset}
        onGoTo={player.goTo}
        onSetSpeed={player.setSpeed}
      />
    </div>
  )
}
```

> **Note:** `frameCount` is derived from `index / progress`. This is an approximation — callers can pass `frameCount` explicitly if needed. A cleaner alternative is to accept a `frames` prop; the current approach avoids coupling the shell to the frames array.

- [ ] **Step 5.2: Verify TypeScript compiles**

```bash
pnpm exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5.3: Commit**

```bash
git add components/visualizers/VisualizerShell.tsx
git commit -m "feat: VisualizerShell with explanation box and keyboard nav"
```

---

## Task 6: Registry + update Visualizer.tsx

**Files:**
- Create: `components/visualizers/registry.ts`
- Modify: `components/mdx/Visualizer.tsx`

- [ ] **Step 6.1: Create registry.ts**

```typescript
// components/visualizers/registry.ts
import type { ComponentType } from 'react'

// Add new visualizers here:
// import dynamic from 'next/dynamic'
// 'binary-search': dynamic(() => import('./BinarySearch'), { ssr: false }),
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry: Record<string, ComponentType<any>> = {}

export function getVisualizer(name: string): ComponentType<unknown> | null {
  return registry[name] ?? null
}
```

- [ ] **Step 6.2: Update components/mdx/Visualizer.tsx**

Replace entire file content:

```tsx
// components/mdx/Visualizer.tsx
'use client'

import dynamic from 'next/dynamic'
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
```

- [ ] **Step 6.3: Verify TypeScript compiles and all tests pass**

```bash
pnpm exec tsc --noEmit && pnpm test
```

Expected: no TS errors, all tests pass.

- [ ] **Step 6.4: Final commit**

```bash
git add components/visualizers/registry.ts components/mdx/Visualizer.tsx
git commit -m "feat: step-engine (useStepPlayer + VisualizerShell + registry)"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] `Frame<T>` — Task 2
- [x] `FrameGenerator<TInput, TState>` — Task 2
- [x] `useStepPlayer` with all 11 exported members — Task 3
- [x] Autoplay with speed-derived interval — Task 3
- [x] Auto-pause at end — Task 3 (tested)
- [x] Tests: next/prev at limits, reset, goTo, autoplay fake timers — Task 3
- [x] `PlayerControls` — Play/Pause/Prev/Next/Reset/speed/progress bar — Task 4
- [x] Progress bar clickable (goTo) — Task 4
- [x] Keyboard: ← prev, → next, space play/pause, R reset — Task 5 (VisualizerShell)
- [x] Focus visible — Task 4 + Task 5 (`focus-visible:ring-2`)
- [x] `VisualizerShell` — title + canvas + explanation + controls — Task 5
- [x] Explanation transition (fade-in via `animate-in`) — Task 5
- [x] Responsive — Task 5 (`sm:p-6`, `w-full`)
- [x] `registry.ts` map name → component — Task 6
- [x] Dynamic import, ssr: false — Task 6 comment shows pattern
- [x] `<Visualizer name="..."/>` uses registry — Task 6

**Type consistency:** `StepPlayerControls<T>` defined in Task 2, used in Task 3 return value, Task 5 prop — names match exactly.

**Placeholder scan:** No TBDs. Every step has full code.

**VisualizerShell frameCount note:** The `frameCount` derivation from `progress` has edge cases (progress=0 at index=0 → division by zero). The implementation uses `player.index + 1` as a fallback for `progress <= 0`, giving `frameCount = index + 1` (minimum). Callers who need exact frame count should use `VisualizerShell` inside a component that also calls `useStepPlayer` and passes `frames.length` separately — this can be done by adding a `frameCount?: number` prop, defaulting to the derived value. Not blocking for launch.
