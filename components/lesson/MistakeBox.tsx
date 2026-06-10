import { TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MistakeBoxProps {
  children: React.ReactNode
  className?: string
}

export function MistakeBox({ children, className }: MistakeBoxProps) {
  return (
    <div
      className={cn(
        'flex gap-[14px] rounded-[14px] border-l-[3px] border-destructive bg-card px-5 py-[18px]',
        className,
      )}
    >
      <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-[hsl(var(--destructive)/0.12)]">
        <TriangleAlert className="h-4 w-4 text-destructive" />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[13px] font-semibold uppercase tracking-[0.06em] text-destructive">
          Greșeli frecvente
        </span>
        <div className="text-[14.5px] leading-[1.55] text-foreground">
          {children}
        </div>
      </div>
    </div>
  )
}
