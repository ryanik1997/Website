import type { ReactNode } from 'react'

interface Props {
  className?: string
  id?: string
  children: ReactNode
}

export default function ExamHighlightZone({ className, id, children }: Props) {
  return (
    <div className={className} id={id} data-exam-highlight-zone>
      {children}
    </div>
  )
}