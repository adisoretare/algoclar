import { cn } from '@/lib/utils'

export type Difficulty = 'baza' | 'mediu' | 'greu' | 'baraj'

const STYLES: Record<Difficulty, { wrap: string; dot: string }> = {
  baza: {
    wrap: 'bg-[hsl(var(--success)/0.12)] text-success',
    dot: 'bg-success',
  },
  mediu: {
    wrap: 'bg-accent text-accent-foreground',
    dot: 'bg-primary',
  },
  greu: {
    wrap: 'bg-[hsl(var(--warning)/0.14)] text-warning',
    dot: 'bg-warning',
  },
  baraj: {
    wrap: 'bg-[hsl(var(--secondary)/0.12)] text-secondary',
    dot: 'bg-secondary',
  },
}

const LABELS: Record<Difficulty, string> = {
  baza: 'Bază',
  mediu: 'Mediu',
  greu: 'Greu',
  baraj: 'Baraj',
}

interface DifficultyBadgeProps {
  level: Difficulty
  className?: string
}

export function DifficultyBadge({ level, className }: DifficultyBadgeProps) {
  const s = STYLES[level]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[6px] px-[10px] py-[5px] font-mono text-xs font-medium',
        s.wrap,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {LABELS[level]}
    </span>
  )
}
