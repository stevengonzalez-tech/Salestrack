import { classNames } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
}

export default function Card({ children, className, padding = true }: CardProps) {
  return (
    <div className={classNames('card', padding && 'p-6', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={classNames('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-slate-900">{children}</h3>
}
