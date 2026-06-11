import Link from 'next/link'
import { BookOpen, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GradeCardProps {
  grade: number
  label: string
  chapterCount: number
  lessonCount: number
  href: string
}

export function GradeCard({
  grade,
  label,
  chapterCount,
  lessonCount,
  href,
}: GradeCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col gap-4 rounded-[16px] border border-border bg-card p-[22px]',
        'shadow-[0_1px_2px_rgba(19,24,38,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.30)]',
        'transition-all duration-[180ms]',
        'hover:-translate-y-[3px] hover:border-primary',
        'hover:shadow-[0_14px_32px_-14px_rgba(19,24,38,0.22),0_2px_6px_rgba(19,24,38,0.05)]',
        'dark:hover:shadow-[0_16px_36px_-14px_rgba(0,0,0,0.60),0_2px_6px_rgba(0,0,0,0.40)]',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
          Clasa {grade}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>

      <h2 className="font-heading text-[20px] font-semibold leading-snug text-card-foreground">
        {label}
      </h2>

      <div className="flex items-center gap-4 text-[13px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 opacity-70" />
          {chapterCount} {chapterCount === 1 ? 'capitol' : 'capitole'}
        </span>
        {lessonCount > 0 && (
          <span className="font-mono text-primary">
            {lessonCount} {lessonCount === 1 ? 'lecție' : 'lecții'}
          </span>
        )}
      </div>
    </Link>
  )
}
