import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ObservationBoxProps {
  children: React.ReactNode
  className?: string
}

export function ObservationBox({ children, className }: ObservationBoxProps) {
  return (
    <div
      className={cn(
        'flex gap-[14px] rounded-[14px] border-l-[3px] border-secondary bg-[hsl(var(--secondary)/0.08)] px-5 py-[18px]',
        className,
      )}
    >
      <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-secondary">
        <Star className="h-4 w-4 text-white" />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[13px] font-semibold uppercase tracking-[0.06em] text-secondary">
          Observația-cheie
        </span>
        <div className="text-[14.5px] leading-[1.55] text-foreground">
          {children}
        </div>
      </div>
    </div>
  )
}
