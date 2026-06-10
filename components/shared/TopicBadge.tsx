import { cn } from '@/lib/utils'

interface TopicBadgeProps {
  label: string
  variant?: 'default' | 'accent'
  className?: string
}

export function TopicBadge({
  label,
  variant = 'default',
  className,
}: TopicBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[6px] border px-[9px] py-1 font-mono text-[11.5px]',
        variant === 'default'
          ? 'border-border bg-transparent text-muted-foreground'
          : 'border-primary bg-accent text-primary',
        className,
      )}
    >
      {label}
    </span>
  )
}
