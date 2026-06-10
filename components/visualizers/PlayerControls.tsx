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
