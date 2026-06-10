import Link from 'next/link'
import { ArrowRight, Check, Link as LinkIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TopicBadge } from '@/components/shared/TopicBadge'

type Stage = 'OJI' | 'ONI'
type Status = 'explicata' | 'linkuita' | 'in-lucru'

interface ProblemCardProps {
  href: string
  stage: Stage
  year: number
  grade: number
  title: string
  topics: string[]
  status: Status
  active?: boolean
}

const STATUS_CONFIG: Record<
  Status,
  { label: string; Icon: React.ElementType | null; cls: string }
> = {
  explicata: {
    label: 'Explicată',
    Icon: Check,
    cls: 'bg-[hsl(var(--success)/0.12)] text-success',
  },
  linkuita: {
    label: 'Linkuită',
    Icon: LinkIcon,
    cls: 'bg-accent text-primary',
  },
  'in-lucru': {
    label: 'În lucru',
    Icon: null,
    cls: 'bg-muted text-muted-foreground',
  },
}

export function ProblemCard({
  href,
  stage,
  year,
  grade,
  title,
  topics,
  status,
  active = false,
}: ProblemCardProps) {
  const { label, Icon, cls } = STATUS_CONFIG[status]

  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col gap-[14px] rounded-[16px] border bg-card px-[22px] py-[20px]',
        'shadow-[0_1px_2px_rgba(19,24,38,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.30)]',
        'transition-all duration-[180ms]',
        'hover:-translate-y-[3px] hover:border-primary',
        'hover:shadow-[0_14px_32px_-14px_rgba(19,24,38,0.22),0_2px_6px_rgba(19,24,38,0.05)]',
        'dark:hover:shadow-[0_16px_36px_-14px_rgba(0,0,0,0.60),0_2px_6px_rgba(0,0,0,0.40)]',
        active ? 'border-secondary ring-1 ring-secondary' : 'border-border',
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'rounded-[6px] px-2 py-1 font-mono text-[11px] font-bold text-white',
            stage === 'OJI' ? 'bg-primary' : 'bg-secondary',
          )}
        >
          {stage}
        </span>
        <span className="font-mono text-[12px] text-muted-foreground">
          {year} · clasa {grade}
        </span>
      </div>

      <h3 className="font-heading text-[18px] font-semibold leading-snug text-card-foreground">
        {title}
      </h3>

      {topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topics.map((t) => (
            <TopicBadge key={t} label={t} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
            cls,
          )}
        >
          {Icon && <Icon className="h-3 w-3" />}
          {label}
        </span>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}
