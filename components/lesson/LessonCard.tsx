import Link from 'next/link'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DifficultyBadge, type Difficulty } from '@/components/shared/DifficultyBadge'

interface LessonCardProps {
  href: string
  chapter: string
  title: string
  duration: string
  difficulty: Difficulty
  progress?: number
}

export function LessonCard({
  href,
  chapter,
  title,
  duration,
  difficulty,
  progress = 0,
}: LessonCardProps) {
  const completed = progress >= 100

  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col gap-[14px] rounded-[16px] border bg-card p-[22px]',
        'shadow-[0_1px_2px_rgba(19,24,38,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.30)]',
        'transition-all duration-[180ms]',
        'hover:-translate-y-[3px] hover:border-primary',
        'hover:shadow-[0_14px_32px_-14px_rgba(19,24,38,0.22),0_2px_6px_rgba(19,24,38,0.05)]',
        'dark:hover:shadow-[0_16px_36px_-14px_rgba(0,0,0,0.60),0_2px_6px_rgba(0,0,0,0.40)]',
        completed ? 'border-success' : 'border-border',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
          {chapter}
        </span>
        <DifficultyBadge level={difficulty} />
      </div>

      <h3 className="font-heading text-[20px] font-semibold leading-snug text-card-foreground">
        {title}
      </h3>

      <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
        <Clock className="h-3.5 w-3.5 opacity-70" />
        <span>{duration}</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <div
          className="h-[7px] w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all',
              completed ? 'bg-success' : 'bg-primary',
            )}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <span
          className={cn(
            'font-mono text-xs',
            completed ? 'text-success' : 'text-primary',
          )}
        >
          {completed ? '✓ Completat' : `${progress}%`}
        </span>
      </div>
    </Link>
  )
}
