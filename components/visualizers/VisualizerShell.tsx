'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StepPlayerControls } from '@/lib/visualizers/types'
import { PlayerControls } from './PlayerControls'

interface VisualizerShellProps<T> {
  title: string
  player: StepPlayerControls<T>
  frameCount: number
  children: React.ReactNode
  ambient?: boolean
  labZone?: React.ReactNode
}

export function VisualizerShell<T>({
  title,
  player,
  frameCount,
  children,
  ambient = false,
  labZone,
}: VisualizerShellProps<T>) {
  const [labOpen, setLabOpen] = useState(false)

  if (ambient) {
    return <>{children}</>
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const tag = (e.target as HTMLElement).tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return
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
      role="region"
      aria-label={title}
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

      {/* Canvas */}
      <div className="min-h-[200px] w-full">{children}</div>

      {/* Explanation */}
      <div
        key={player.index}
        aria-live="polite"
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

      {/* Lab zone — collapsible */}
      {labZone && (
        <div className="border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setLabOpen(o => !o)}
            className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
            aria-expanded={labOpen}
          >
            <ChevronDown
              className={cn(
                'h-3 w-3 transition-transform duration-200',
                labOpen && 'rotate-180',
              )}
              aria-hidden
            />
            Încearcă cu datele tale
          </button>
          <div
            className="grid transition-[grid-template-rows] duration-300 ease-out"
            style={{ gridTemplateRows: labOpen ? '1fr' : '0fr' }}
          >
            <div className="overflow-hidden">
              <div className="mt-3">{labZone}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
