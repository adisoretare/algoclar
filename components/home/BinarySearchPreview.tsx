import { RotateCcw, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

const ARRAY = [3, 7, 12, 19, 25, 31, 42]
const L_IDX = 0
const MID_IDX = 3
const R_IDX = 6

export function BinarySearchPreview() {
  return (
    <div className="rounded-[16px] border border-border bg-card p-6 shadow-[0_1px_2px_rgba(19,24,38,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.30)]">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">
          Căutare binară · pas 3 din 5
        </span>
        <span className="rounded-full bg-accent px-2.5 py-1 font-mono text-xs text-accent-foreground">
          Demo
        </span>
      </div>

      {/* Array */}
      <div className="flex gap-1.5">
        {ARRAY.map((val, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-[8px] border font-mono text-sm font-semibold sm:h-10 sm:w-10',
                i === MID_IDX
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-muted text-muted-foreground',
              )}
            >
              {val}
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">
              {i === L_IDX ? 'L' : i === MID_IDX ? 'M' : i === R_IDX ? 'R' : ''}
            </span>
          </div>
        ))}
      </div>

      {/* Status */}
      <p className="mt-4 font-mono text-sm text-foreground">
        19 &lt; 25 → caută în dreapta
      </p>

      {/* Decorative controls — aria-hidden, non-interactive */}
      <div
        className="mt-5 flex items-center gap-2 opacity-60"
        aria-hidden="true"
      >
        <button
          tabIndex={-1}
          className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-muted pointer-events-none"
        >
          <RotateCcw className="h-4 w-4 text-foreground" />
        </button>
        <button
          tabIndex={-1}
          className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-muted pointer-events-none"
        >
          <ChevronLeft className="h-4 w-4 text-foreground" />
        </button>
        <div className="mx-1 h-6 w-px bg-border" />
        <button
          tabIndex={-1}
          className="flex h-11 w-11 items-center justify-center rounded-[11px] bg-primary pointer-events-none"
        >
          <Play className="h-4 w-4 fill-primary-foreground text-primary-foreground" />
        </button>
        <div className="mx-1 h-6 w-px bg-border" />
        <button
          tabIndex={-1}
          className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-muted pointer-events-none"
        >
          <ChevronRight className="h-4 w-4 text-foreground" />
        </button>
      </div>
    </div>
  )
}
