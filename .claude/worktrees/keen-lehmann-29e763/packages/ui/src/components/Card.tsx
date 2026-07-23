import { HTMLAttributes } from 'react'
import { cn } from './utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-xl border p-4', className)}
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      {...props}
    />
  )
}
