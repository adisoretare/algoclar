import { cn } from '@/lib/utils'

interface LessonHookProps {
  children: React.ReactNode
  className?: string
}

export function LessonHook({ children, className }: LessonHookProps) {
  return (
    <div
      className={cn(
        'my-6 rounded-[16px] border border-primary/20 bg-accent px-6 py-5',
        'text-[15px] leading-[1.65] text-foreground',
        className,
      )}
    >
      <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
        De ce contează?
      </p>
      {children}
    </div>
  )
}
