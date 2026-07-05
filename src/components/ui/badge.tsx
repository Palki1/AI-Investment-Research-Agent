import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'danger' | 'outline' | 'accent';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          'border-transparent bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/80': variant === 'default',
          'border-transparent bg-[var(--color-success)] text-white': variant === 'success',
          'border-transparent bg-[var(--color-danger)] text-white': variant === 'danger',
          'border-[var(--color-border)] text-white': variant === 'outline',
          'border-transparent bg-[var(--color-accent)] text-white': variant === 'accent',
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
